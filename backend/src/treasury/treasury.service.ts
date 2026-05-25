import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../database/prisma.service";
import {
  treasurySummarySchema,
  transactionHistorySchema,
  type TreasurySummaryInput,
  type TransactionHistoryInput,
} from "./dto/treasury.dto";

type MoneyTotals = {
  contributions: number;
  fees: number;
  investmentAllocations: number;
  investmentReturns: number;
  payouts: number;
  refunds: number;
};

@Injectable()
export class TreasuryService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(actorId: string, input: TreasurySummaryInput) {
    const data = treasurySummarySchema.parse(input);
    await this.ensureMember(actorId, data.groupId);

    const [group, totals, ownership] = await Promise.all([
      this.prisma.group.findUniqueOrThrow({ where: { id: data.groupId } }),
      this.getMoneyTotals(data.groupId),
      this.calculateOwnership(data.groupId),
    ]);

    const lockedBalance =
      totals.investmentAllocations - totals.investmentReturns;
    const withdrawableBalance =
      totals.contributions +
      totals.investmentReturns -
      totals.investmentAllocations -
      totals.payouts -
      totals.refunds -
      totals.fees;
    const roiPercentage =
      totals.investmentAllocations > 0
        ? (totals.investmentReturns / totals.investmentAllocations) * 100
        : 0;

    return {
      currency: group.currency,
      groupId: group.id,
      lockedBalance: Math.max(lockedBalance, 0),
      ownership,
      roiPercentage,
      totalContributions: totals.contributions,
      totalFees: totals.fees,
      totalInvestmentAllocations: totals.investmentAllocations,
      totalInvestmentReturns: totals.investmentReturns,
      totalPayouts: totals.payouts,
      totalRefunds: totals.refunds,
      treasuryBalance: withdrawableBalance + Math.max(lockedBalance, 0),
      withdrawableBalance: Math.max(withdrawableBalance, 0),
    };
  }

  async getTransactions(actorId: string, input: TransactionHistoryInput) {
    const data = transactionHistorySchema.parse(input);
    await this.ensureMember(actorId, data.groupId);

    return this.prisma.treasuryTransaction.findMany({
      orderBy: { createdAt: "desc" },
      take: data.limit,
      where: {
        groupId: data.groupId,
        type: data.type,
      },
    });
  }

  async recalculateOwnership(actorId: string, groupId: string) {
    await this.ensureMember(actorId, groupId);
    return this.prisma.$transaction(async (tx) => {
      const paidContributions = await tx.contribution.groupBy({
        by: ["userId"],
        _sum: { amount: true },
        where: {
          groupId,
          status: "PAID",
        },
      });

      const total = paidContributions.reduce(
        (sum, row) => sum + this.decimalToNumber(row._sum.amount),
        0,
      );
      const updates = [];

      for (const row of paidContributions) {
        const userTotal = this.decimalToNumber(row._sum.amount);
        const percentage = total > 0 ? (userTotal / total) * 100 : 0;
        updates.push(
          tx.groupMember.update({
            data: { ownershipPercentage: percentage },
            where: { groupId_userId: { groupId, userId: row.userId } },
          }),
        );
      }

      await Promise.all(updates);

      return {
        groupId,
        recalculatedMembers: updates.length,
        totalContributions: total,
      };
    });
  }

  private async calculateOwnership(groupId: string) {
    const paidContributions = await this.prisma.contribution.groupBy({
      by: ["userId"],
      _sum: { amount: true },
      where: {
        groupId,
        status: "PAID",
      },
    });

    const users = await this.prisma.user.findMany({
      select: { fullName: true, id: true },
      where: { id: { in: paidContributions.map((row) => row.userId) } },
    });
    const namesById = new Map(users.map((user) => [user.id, user.fullName]));
    const total = paidContributions.reduce(
      (sum, row) => sum + this.decimalToNumber(row._sum.amount),
      0,
    );

    return paidContributions.map((row) => {
      const contributed = this.decimalToNumber(row._sum.amount);
      return {
        contributed,
        ownershipPercentage: total > 0 ? (contributed / total) * 100 : 0,
        userId: row.userId,
        userName: namesById.get(row.userId) ?? "Member",
      };
    });
  }

  private async getMoneyTotals(groupId: string): Promise<MoneyTotals> {
    const rows = await this.prisma.treasuryTransaction.groupBy({
      by: ["type"],
      _sum: { amount: true },
      where: { groupId },
    });

    const totals: MoneyTotals = {
      contributions: 0,
      fees: 0,
      investmentAllocations: 0,
      investmentReturns: 0,
      payouts: 0,
      refunds: 0,
    };

    for (const row of rows) {
      const amount = this.decimalToNumber(row._sum.amount);
      if (row.type === "CONTRIBUTION") totals.contributions += amount;
      if (row.type === "FEE") totals.fees += amount;
      if (row.type === "INVESTMENT_ALLOCATION")
        totals.investmentAllocations += amount;
      if (row.type === "INVESTMENT_RETURN") totals.investmentReturns += amount;
      if (row.type === "PAYOUT") totals.payouts += amount;
      if (row.type === "REFUND") totals.refunds += amount;
    }

    return totals;
  }

  private async ensureMember(actorId: string, groupId: string) {
    const member = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: actorId } },
    });

    if (!member) {
      throw new NotFoundException("Treasury not found for this member.");
    }

    if (!["ACTIVE", "SUSPENDED", "EXITED"].includes(member.status)) {
      throw new ForbiddenException(
        "Treasury access is not available for this membership status.",
      );
    }

    return member;
  }

  private decimalToNumber(value: unknown) {
    if (!value) return 0;
    if (typeof value === "number") return value;
    if (typeof value === "string") return Number(value);
    if (typeof value === "object" && "toString" in value)
      return Number(value.toString());
    return 0;
  }
}
