import { randomUUID } from "node:crypto";
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../database/prisma.service";
import {
  executeMaturityPayoutsSchema,
  payoutScheduleSchema,
  reinvestProfitSchema,
  voluntaryExitSchema,
  type ExecuteMaturityPayoutsInput,
  type PayoutScheduleInput,
  type ReinvestProfitInput,
  type VoluntaryExitInput,
} from "./dto/payouts.dto";

type TreasuryTotals = {
  contributions: number;
  fees: number;
  investmentAllocations: number;
  investmentReturns: number;
  payouts: number;
  refunds: number;
};

type MemberPosition = {
  contributionPrincipal: number;
  currency: string;
  lockedProfit: number;
  memberId: string;
  memberName: string;
  ownershipPercentage: number;
  paidLockedProfit: number;
  paidPrincipal: number;
  projectedMaturityPayout: number;
  reinvestedProfit: number;
  status: string;
  userId: string;
  voluntaryExitPayout: number;
};

@Injectable()
export class PayoutsService {
  constructor(private readonly prisma: PrismaService) {}

  async previewSchedule(actorId: string, input: PayoutScheduleInput) {
    const data = payoutScheduleSchema.parse(input);
    await this.ensureMember(actorId, data.groupId);

    const [group, totals, positions] = await Promise.all([
      this.prisma.group.findUniqueOrThrow({ where: { id: data.groupId } }),
      this.getTreasuryTotals(data.groupId),
      this.getMemberPositions(data.groupId),
    ]);
    const lockedBalance = Math.max(
      totals.investmentAllocations - totals.investmentReturns,
      0,
    );
    const withdrawableTreasury = this.getWithdrawableTreasury(totals);
    const maturityTotal = positions.reduce(
      (sum, position) => sum + position.projectedMaturityPayout,
      0,
    );

    return {
      currency: group.currency,
      groupId: group.id,
      groupStatus: group.status,
      lockedBalance,
      maturityTotal,
      positions,
      reinvestmentPool: positions.reduce(
        (sum, position) => sum + position.lockedProfit,
        0,
      ),
      withdrawableTreasury,
    };
  }

  async requestVoluntaryExit(
    actorId: string,
    groupId: string,
    input: VoluntaryExitInput,
  ) {
    const data = voluntaryExitSchema.parse(input);
    const member = await this.ensureActiveMember(actorId, groupId);
    const schedule = await this.previewSchedule(actorId, { groupId });
    const position = schedule.positions.find((item) => item.userId === actorId);

    if (!position) {
      throw new NotFoundException("Payout position not found.");
    }

    if (position.voluntaryExitPayout <= 0) {
      throw new BadRequestException("No withdrawable principal is available.");
    }

    return this.prisma.$transaction(async (tx) => {
      const payout = await tx.treasuryTransaction.create({
        data: {
          amount: position.voluntaryExitPayout,
          currency: position.currency,
          groupId,
          metadata: {
            reason: data.reason,
            userId: actorId,
            workflow: "VOLUNTARY_EXIT",
            payoutBreakdown: {
              lockedProfit: 0,
              principal: position.voluntaryExitPayout,
            },
          },
          reference: `exit-${groupId}-${actorId}-${randomUUID()}`,
          type: "PAYOUT",
        },
      });

      await tx.groupMember.update({
        data: {
          exitedAt: new Date(),
          status: "EXITED",
        },
        where: { id: member.id },
      });

      await tx.auditLog.create({
        data: {
          action: "payouts.voluntary_exit",
          actorId,
          target: `group_member:${member.id}`,
          metadata: {
            groupId,
            payoutId: payout.id,
            reason: data.reason,
            voluntaryExitPayout: position.voluntaryExitPayout,
          },
        },
      });

      return {
        memberStatus: "EXITED",
        payout,
        position: {
          ...position,
          voluntaryExitPayout: 0,
        },
      };
    });
  }

  async executeMaturityPayouts(
    actorId: string,
    input: ExecuteMaturityPayoutsInput,
  ) {
    const data = executeMaturityPayoutsSchema.parse(input);
    await this.ensureGroupAdmin(actorId, data.groupId);
    const schedule = await this.previewSchedule(actorId, {
      groupId: data.groupId,
    });
    const payoutDate = data.payoutDate ?? new Date();
    const payablePositions = schedule.positions.filter(
      (position) =>
        position.status === "ACTIVE" && position.projectedMaturityPayout > 0,
    );

    if (payablePositions.length === 0) {
      throw new BadRequestException("No maturity payouts are available.");
    }

    return this.prisma.$transaction(async (tx) => {
      const payouts = await Promise.all(
        payablePositions.map((position) =>
          tx.treasuryTransaction.create({
            data: {
              amount: position.projectedMaturityPayout,
              currency: position.currency,
              groupId: data.groupId,
              metadata: {
                payoutDate: payoutDate.toISOString(),
                userId: position.userId,
                workflow: "MATURITY_PAYOUT",
                payoutBreakdown: {
                  lockedProfit: position.lockedProfit,
                  principal:
                    position.projectedMaturityPayout - position.lockedProfit,
                },
              },
              reference: `maturity-${data.groupId}-${position.userId}-${randomUUID()}`,
              type: "PAYOUT",
            },
          }),
        ),
      );

      await tx.group.update({
        data: { status: "MATURED" },
        where: { id: data.groupId },
      });

      await tx.auditLog.create({
        data: {
          action: "payouts.maturity.execute",
          actorId,
          target: `group:${data.groupId}`,
          metadata: {
            payoutDate: payoutDate.toISOString(),
            payoutIds: payouts.map((payout) => payout.id),
            totalAmount: payouts.reduce(
              (sum, payout) => sum + this.decimalToNumber(payout.amount),
              0,
            ),
          },
        },
      });

      return {
        groupStatus: "MATURED",
        payoutCount: payouts.length,
        payouts,
      };
    });
  }

  async reinvestProfit(actorId: string, input: ReinvestProfitInput) {
    const data = reinvestProfitSchema.parse(input);
    await this.ensureActiveMember(actorId, data.groupId);
    const schedule = await this.previewSchedule(actorId, {
      groupId: data.groupId,
    });
    const position = schedule.positions.find((item) => item.userId === actorId);

    if (!position) {
      throw new NotFoundException("Payout position not found.");
    }

    if (data.amount > position.lockedProfit) {
      throw new BadRequestException(
        "Reinvestment amount exceeds available locked profit.",
      );
    }

    const allocationType =
      data.target === "SELECTED_INVESTMENTS"
        ? "INVESTMENT_ALLOCATION"
        : "ADJUSTMENT";

    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.treasuryTransaction.create({
        data: {
          amount: data.amount,
          currency: position.currency,
          groupId: data.groupId,
          metadata: {
            target: data.target,
            userId: actorId,
            workflow: "PROFIT_REINVESTMENT",
            payoutBreakdown: {
              lockedProfit: data.amount,
              principal: 0,
            },
          },
          reference: `reinvest-${data.groupId}-${actorId}-${randomUUID()}`,
          type: allocationType,
        },
      });

      await tx.auditLog.create({
        data: {
          action: "payouts.profit_reinvest",
          actorId,
          target: `group:${data.groupId}`,
          metadata: {
            amount: data.amount,
            target: data.target,
            transactionId: transaction.id,
          },
        },
      });

      return {
        remainingLockedProfit: position.lockedProfit - data.amount,
        transaction,
      };
    });
  }

  private async getMemberPositions(groupId: string): Promise<MemberPosition[]> {
    const [group, members, contributions, transactions, totals] =
      await Promise.all([
        this.prisma.group.findUniqueOrThrow({ where: { id: groupId } }),
        this.prisma.groupMember.findMany({
          include: { user: { select: { fullName: true } } },
          orderBy: { joinedAt: "asc" },
          where: { groupId },
        }),
        this.prisma.contribution.groupBy({
          by: ["userId"],
          _sum: { amount: true },
          where: { groupId, status: "PAID" },
        }),
        this.prisma.treasuryTransaction.findMany({
          where: {
            groupId,
            type: { in: ["PAYOUT", "ADJUSTMENT", "INVESTMENT_ALLOCATION"] },
          },
        }),
        this.getTreasuryTotals(groupId),
      ]);
    const contributionByUser = new Map(
      contributions.map((row) => [
        row.userId,
        this.decimalToNumber(row._sum.amount),
      ]),
    );
    const totalContributions = contributions.reduce(
      (sum, row) => sum + this.decimalToNumber(row._sum.amount),
      0,
    );

    return members.map((member) => {
      const contributionPrincipal = contributionByUser.get(member.userId) ?? 0;
      const ownership =
        totalContributions > 0
          ? contributionPrincipal / totalContributions
          : this.decimalToNumber(member.ownershipPercentage) / 100;
      const memberTransactions = transactions.filter(
        (transaction) =>
          this.getMetadataString(transaction.metadata, "userId") ===
          member.userId,
      );
      const paidPrincipal = this.sumMetadataBreakdown(
        memberTransactions,
        "principal",
        "PAYOUT",
      );
      const paidLockedProfit = this.sumMetadataBreakdown(
        memberTransactions,
        "lockedProfit",
        "PAYOUT",
      );
      const reinvestedProfit = this.sumMetadataBreakdown(
        memberTransactions.filter(
          (transaction) =>
            this.getMetadataString(transaction.metadata, "workflow") ===
            "PROFIT_REINVESTMENT",
        ),
        "lockedProfit",
      );
      const lockedProfit = Math.max(
        totals.investmentReturns * ownership -
          paidLockedProfit -
          reinvestedProfit,
        0,
      );
      const principal = Math.max(contributionPrincipal - paidPrincipal, 0);

      return {
        contributionPrincipal: principal,
        currency: group.currency,
        lockedProfit,
        memberId: member.id,
        memberName: member.user.fullName,
        ownershipPercentage: ownership * 100,
        paidLockedProfit,
        paidPrincipal,
        projectedMaturityPayout: principal + lockedProfit,
        reinvestedProfit,
        status: member.status,
        userId: member.userId,
        voluntaryExitPayout: principal,
      };
    });
  }

  private async getTreasuryTotals(groupId: string): Promise<TreasuryTotals> {
    const rows = await this.prisma.treasuryTransaction.groupBy({
      by: ["type"],
      _sum: { amount: true },
      where: { groupId },
    });
    const totals: TreasuryTotals = {
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

  private getWithdrawableTreasury(totals: TreasuryTotals) {
    return Math.max(
      totals.contributions +
        totals.investmentReturns -
        totals.investmentAllocations -
        totals.payouts -
        totals.refunds -
        totals.fees,
      0,
    );
  }

  private async ensureMember(actorId: string, groupId: string) {
    const member = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: actorId } },
    });

    if (!member) {
      throw new NotFoundException("Payout account not found for this member.");
    }

    return member;
  }

  private async ensureActiveMember(actorId: string, groupId: string) {
    const member = await this.ensureMember(actorId, groupId);

    if (member.status !== "ACTIVE") {
      throw new ForbiddenException("Active group membership is required.");
    }

    return member;
  }

  private async ensureGroupAdmin(actorId: string, groupId: string) {
    const member = await this.ensureActiveMember(actorId, groupId);

    if (!member.isAdmin) {
      throw new ForbiddenException("Group admin permissions are required.");
    }

    return member;
  }

  private sumMetadataBreakdown(
    transactions: Array<{ metadata: unknown; type?: string }>,
    key: "lockedProfit" | "principal",
    type?: string,
  ) {
    return transactions
      .filter((transaction) => !type || transaction.type === type)
      .reduce((sum, transaction) => {
        const metadata = this.asRecord(transaction.metadata);
        const breakdown = this.asRecord(metadata?.payoutBreakdown);
        return sum + this.decimalToNumber(breakdown?.[key]);
      }, 0);
  }

  private getMetadataString(metadata: unknown, key: string) {
    const value = this.asRecord(metadata)?.[key];
    return typeof value === "string" ? value : undefined;
  }

  private asRecord(value: unknown) {
    return value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : undefined;
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
