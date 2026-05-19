import { createHash } from "node:crypto";
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { nanoid } from "nanoid";

import { PrismaService } from "../database/prisma.service";
import {
  createGroupSchema,
  inviteMemberSchema,
  updateContributionRulesSchema,
  updateMemberAdminSchema,
  updateMemberStatusSchema,
  type CreateGroupInput,
  type InviteMemberInput,
  type UpdateContributionRulesInput,
  type UpdateMemberAdminInput,
  type UpdateMemberStatusInput,
} from "./dto/groups.dto";

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async createGroup(actorId: string, input: CreateGroupInput) {
    const data = createGroupSchema.parse(input);

    return this.prisma.group.create({
      data: {
        createdById: actorId,
        cycleDurationMonths: data.cycleDurationMonths,
        description: data.description,
        monthlyContribution: data.monthlyContribution,
        name: data.name,
        riskProfile: data.riskProfile,
        status: "ACTIVE",
        members: {
          create: {
            contributionAmount: data.monthlyContribution,
            isAdmin: true,
            userId: actorId,
          },
        },
      },
      include: { members: true },
    });
  }

  async getGroup(actorId: string, groupId: string) {
    await this.ensureMember(actorId, groupId);

    return this.prisma.group.findUniqueOrThrow({
      include: {
        investmentBuckets: true,
        members: { include: { user: true } },
        milestoneGoals: true,
      },
      where: { id: groupId },
    });
  }

  async inviteMember(
    actorId: string,
    groupId: string,
    input: InviteMemberInput,
  ) {
    const data = inviteMemberSchema.parse(input);
    await this.ensureGroupAdmin(actorId, groupId);

    const inviteCode = `12C-${nanoid(10).toUpperCase()}`;
    const invite = await this.prisma.groupInvite.create({
      data: {
        codeHash: this.hashInviteCode(inviteCode),
        email: data.email,
        expiresAt: new Date(
          Date.now() + data.expiresInDays * 24 * 60 * 60 * 1000,
        ),
        groupId,
        phone: data.phone,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: "groups.invite.create",
        actorId,
        target: `group:${groupId}`,
        metadata: { inviteId: invite.id },
      },
    });

    return { inviteCode, invite };
  }

  async updateContributionRules(
    actorId: string,
    groupId: string,
    input: UpdateContributionRulesInput,
  ) {
    const data = updateContributionRulesSchema.parse(input);
    await this.ensureGroupAdmin(actorId, groupId);

    return this.prisma.group.update({
      data,
      where: { id: groupId },
    });
  }

  async updateMemberAdmin(
    actorId: string,
    groupId: string,
    memberId: string,
    input: UpdateMemberAdminInput,
  ) {
    const data = updateMemberAdminSchema.parse(input);
    await this.ensureGroupAdmin(actorId, groupId);

    return this.prisma.groupMember.update({
      data,
      where: { id: memberId },
    });
  }

  async updateMemberStatus(
    actorId: string,
    groupId: string,
    memberId: string,
    input: UpdateMemberStatusInput,
  ) {
    const data = updateMemberStatusSchema.parse(input);
    await this.ensureGroupAdmin(actorId, groupId);

    return this.prisma.groupMember.update({
      data: {
        exitedAt: ["EXITED", "REMOVED"].includes(data.status)
          ? new Date()
          : undefined,
        status: data.status,
      },
      where: { id: memberId },
    });
  }

  private async ensureMember(actorId: string, groupId: string) {
    const member = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: actorId } },
    });

    if (!member) {
      throw new NotFoundException("Group not found for this member.");
    }

    return member;
  }

  private async ensureGroupAdmin(actorId: string, groupId: string) {
    const member = await this.ensureMember(actorId, groupId);

    if (!member.isAdmin || member.status !== "ACTIVE") {
      throw new ForbiddenException("Group admin permissions are required.");
    }

    return member;
  }

  private hashInviteCode(inviteCode: string) {
    return createHash("sha256")
      .update(inviteCode.trim().toUpperCase())
      .digest("hex");
  }
}
