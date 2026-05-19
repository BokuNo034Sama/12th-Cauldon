import { Injectable, ForbiddenException } from "@nestjs/common";

import { PrismaService } from "../database/prisma.service";
import {
  recordContributionSchema,
  type RecordContributionInput,
} from "./dto/contributions.dto";

@Injectable()
export class ContributionsService {
  constructor(private readonly prisma: PrismaService) {}

  async recordContribution(actorId: string, input: RecordContributionInput) {
    const data = recordContributionSchema.parse(input);
    const member = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: data.groupId, userId: actorId } },
    });

    if (!member || member.status !== "ACTIVE") {
      throw new ForbiddenException(
        "Active group membership is required to contribute.",
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const contribution = await tx.contribution.create({
        data: {
          amount: data.amount,
          dueAt: data.dueAt ?? new Date(),
          groupId: data.groupId,
          paidAt: new Date(),
          reference: data.reference,
          status: "PAID",
          userId: actorId,
        },
      });

      await tx.treasuryTransaction.create({
        data: {
          amount: data.amount,
          groupId: data.groupId,
          reference: `CONTRIBUTION:${contribution.id}`,
          type: "CONTRIBUTION",
        },
      });

      await tx.groupMember.update({
        data: { missedCycles: 0 },
        where: { id: member.id },
      });

      return contribution;
    });
  }

  async getHistory(actorId: string, groupId?: string) {
    return this.prisma.contribution.findMany({
      orderBy: { dueAt: "desc" },
      where: {
        groupId,
        userId: actorId,
      },
    });
  }

  async processMissedContributions() {
    const pending = await this.prisma.contribution.findMany({
      where: {
        dueAt: { lt: new Date() },
        status: "PENDING",
      },
    });

    const results = [];
    for (const contribution of pending) {
      const result = await this.prisma.$transaction(async (tx) => {
        await tx.contribution.update({
          data: { status: "MISSED" },
          where: { id: contribution.id },
        });

        const member = await tx.groupMember.update({
          data: { missedCycles: { increment: 1 } },
          where: {
            groupId_userId: {
              groupId: contribution.groupId,
              userId: contribution.userId,
            },
          },
        });

        if (member.missedCycles >= 2) {
          await tx.groupMember.update({
            data: { exitedAt: new Date(), status: "REMOVED" },
            where: { id: member.id },
          });
        }

        return {
          contributionId: contribution.id,
          missedCycles: member.missedCycles,
        };
      });
      results.push(result);
    }

    return { processed: results.length, results };
  }
}
