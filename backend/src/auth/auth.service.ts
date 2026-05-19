import { createHash, randomInt, randomUUID } from "node:crypto";
import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import bcrypt from "bcryptjs";

import type { BackendEnv } from "../config/env.schema";
import { PrismaService } from "../database/prisma.service";
import {
  loginSchema,
  signupSchema,
  verifyOtpSchema,
  type LoginInput,
  type SignupInput,
  type VerifyOtpInput,
} from "./dto/auth.dto";

type JwtPayload = {
  role: string;
  sessionId: string;
  sub: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService<BackendEnv, true>,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async signup(input: SignupInput) {
    const data = signupSchema.parse(input);
    const invite = await this.findValidInvite(data.inviteCode);

    if (!invite) {
      throw new ForbiddenException(
        "A valid invite code is required to join 12th Cauldron.",
      );
    }

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        fullName: data.fullName,
        phone: data.phone,
        memberships: {
          create: {
            contributionAmount: data.contributionAmount,
            groupId: invite.groupId,
          },
        },
      },
    });

    await this.prisma.groupInvite.update({
      data: {
        acceptedAt: new Date(),
        status: "ACCEPTED",
      },
      where: { id: invite.id },
    });

    await this.prisma.auditLog.create({
      data: {
        action: "auth.signup",
        actorId: user.id,
        target: `user:${user.id}`,
        metadata: { groupId: invite.groupId },
      },
    });

    return this.issueSession(user.id, user.role);
  }

  async login(input: LoginInput) {
    const data = loginSchema.parse(input);
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: data.identifier }, { phone: data.identifier }],
      },
    });

    if (!user) {
      throw new UnauthorizedException("No user exists for that identifier.");
    }

    const otp = this.generateOtp();
    await this.prisma.otpVerification.create({
      data: {
        codeHash: await bcrypt.hash(otp, 12),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        identifier: data.identifier,
        userId: user.id,
      },
    });

    return {
      delivery: "otp",
      expiresInSeconds: 600,
      ...(this.configService.get("NODE_ENV", { infer: true }) === "development"
        ? { devOtp: otp }
        : {}),
    };
  }

  async verifyOtp(input: VerifyOtpInput) {
    const data = verifyOtpSchema.parse(input);
    const verifications = await this.prisma.otpVerification.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      where: {
        expiresAt: { gt: new Date() },
        identifier: data.identifier,
        verifiedAt: null,
      },
    });

    for (const verification of verifications) {
      if (await bcrypt.compare(data.code, verification.codeHash)) {
        const user = await this.prisma.user.findFirstOrThrow({
          where: {
            OR: [{ email: data.identifier }, { phone: data.identifier }],
          },
        });

        await this.prisma.otpVerification.update({
          data: { verifiedAt: new Date() },
          where: { id: verification.id },
        });

        return this.issueSession(user.id, user.role);
      }
    }

    throw new UnauthorizedException("Invalid or expired OTP code.");
  }

  async verifyAccessToken(token: string) {
    return this.jwtService.verifyAsync<JwtPayload>(token, {
      secret: this.configService.get("JWT_SECRET", { infer: true }),
    });
  }

  private async issueSession(userId: string, role: string) {
    const refreshToken = randomUUID();
    const session = await this.prisma.session.create({
      data: {
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        refreshHash: await bcrypt.hash(refreshToken, 12),
        userId,
      },
    });

    const accessToken = await this.jwtService.signAsync(
      { role, sessionId: session.id, sub: userId },
      {
        expiresIn: "15m",
        secret: this.configService.get("JWT_SECRET", { infer: true }),
      },
    );

    return {
      accessToken,
      refreshToken,
      tokenType: "Bearer",
    };
  }

  private async findValidInvite(inviteCode: string) {
    const codeHash = this.hashInviteCode(inviteCode);

    return this.prisma.groupInvite.findFirst({
      where: {
        codeHash,
        expiresAt: { gt: new Date() },
        status: "PENDING",
      },
    });
  }

  private generateOtp() {
    return randomInt(100000, 999999).toString();
  }

  private hashInviteCode(inviteCode: string) {
    return createHash("sha256")
      .update(inviteCode.trim().toUpperCase())
      .digest("hex");
  }
}
