import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../database/prisma.service";
import {
  createMilestoneGoalSchema,
  listMilestoneGoalsSchema,
  type CreateMilestoneGoalInput,
  type ListMilestoneGoalsInput,
} from "./dto/milestones.dto";

type TreasurySnapshot = {
  allocatedToInvestments: number;
  availableForGoals: number;
  currency: string;
  grossTreasury: number;
  lockedBalance: number;
  returnedFromInvestments: number;
  totalContributions: number;
  totalPayouts: number;
};

@Injectable()
export class MilestonesService {
  constructor(private readonly prisma: PrismaService) {}

  async createGoal(actorId: string, input: CreateMilestoneGoalInput) {
    const data = createMilestoneGoalSchema.parse(input);
    const member = await this.ensureGroupAdmin(actorId, data.groupId);
    const group = await this.prisma.group.findUniqueOrThrow({
      where: { id: data.groupId },
    });

    const goal = await this.prisma.milestoneGoal.create({
      data: {
        currency: group.currency,
        dueAt: data.dueAt,
        groupId: data.groupId,
        name: data.name,
        targetAmount: data.targetAmount,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: "milestones.goal.create",
        actorId,
        target: `milestone:${goal.id}`,
        metadata: {
          groupId: data.groupId,
          isGroupAdmin: member.isAdmin,
          targetAmount: data.targetAmount,
        },
      },
    });

    return goal;
  }

  async listGoals(actorId: string, input: ListMilestoneGoalsInput) {
    const data = listMilestoneGoalsSchema.parse(input);
    await this.ensureMember(actorId, data.groupId);

    const [goals, snapshot] = await Promise.all([
      this.prisma.milestoneGoal.findMany({
        orderBy: [
          { achievedAt: "asc" },
          { dueAt: "asc" },
          { createdAt: "asc" },
        ],
        where: { groupId: data.groupId },
      }),
      this.getTreasurySnapshot(data.groupId),
    ]);

    return {
      allocation: this.getAllocationVisibility(goals, snapshot),
      goals: this.applyProgress(goals, snapshot),
      groupId: data.groupId,
      treasury: snapshot,
    };
  }

  async refreshGoal(actorId: string, goalId: string) {
    const goal = await this.prisma.milestoneGoal.findUnique({
      where: { id: goalId },
    });

    if (!goal) {
      throw new NotFoundException("Milestone goal not found.");
    }

    await this.ensureGroupAdmin(actorId, goal.groupId);

    const snapshot = await this.getTreasurySnapshot(goal.groupId);
    const goals = await this.prisma.milestoneGoal.findMany({
      orderBy: [{ achievedAt: "asc" }, { dueAt: "asc" }, { createdAt: "asc" }],
      where: { groupId: goal.groupId },
    });
    const enrichedGoals = this.applyProgress(goals, snapshot);
    const refreshedGoal = enrichedGoals.find((item) => item.id === goalId);

    if (!refreshedGoal) {
      throw new NotFoundException("Milestone goal not found.");
    }

    if (refreshedGoal.isAchieved && !goal.achievedAt) {
      const achieved = await this.prisma.milestoneGoal.update({
        data: { achievedAt: new Date() },
        where: { id: goalId },
      });

      await this.prisma.auditLog.create({
        data: {
          action: "milestones.goal.achieved",
          actorId,
          target: `milestone:${goalId}`,
          metadata: {
            allocatedAmount: refreshedGoal.allocatedAmount,
            groupId: goal.groupId,
            targetAmount: refreshedGoal.targetAmount,
          },
        },
      });

      return {
        ...refreshedGoal,
        achievedAt: achieved.achievedAt,
        celebration: {
          message: `${achieved.name} is fully funded.`,
          type: "GOAL_ACHIEVED",
        },
      };
    }

    return {
      ...refreshedGoal,
      celebration: refreshedGoal.isAchieved
        ? {
            message: `${refreshedGoal.name} is fully funded.`,
            type: "GOAL_ALREADY_ACHIEVED",
          }
        : null,
    };
  }

  private applyProgress(
    goals: Array<{
      achievedAt: Date | null;
      createdAt: Date;
      currency: string;
      dueAt: Date | null;
      groupId: string;
      id: string;
      name: string;
      targetAmount: unknown;
      updatedAt: Date;
    }>,
    snapshot: TreasurySnapshot,
  ) {
    let allocatableBalance = snapshot.availableForGoals;

    return goals.map((goal) => {
      const targetAmount = this.decimalToNumber(goal.targetAmount);
      const allocatedAmount = Math.min(
        Math.max(allocatableBalance, 0),
        targetAmount,
      );
      allocatableBalance -= allocatedAmount;
      const progressPercentage =
        targetAmount > 0 ? (allocatedAmount / targetAmount) * 100 : 0;
      const isAchieved = progressPercentage >= 100;

      return {
        ...goal,
        allocatedAmount,
        gapAmount: Math.max(targetAmount - allocatedAmount, 0),
        isAchieved,
        progressPercentage: Math.min(progressPercentage, 100),
        targetAmount,
      };
    });
  }

  private getAllocationVisibility(
    goals: Array<{ achievedAt: Date | null; targetAmount: unknown }>,
    snapshot: TreasurySnapshot,
  ) {
    const openGoalTarget = goals
      .filter((goal) => !goal.achievedAt)
      .reduce((sum, goal) => sum + this.decimalToNumber(goal.targetAmount), 0);
    const allocatedToGoals = Math.min(
      snapshot.availableForGoals,
      openGoalTarget,
    );

    return {
      allocatedToGoals,
      coveragePercentage:
        openGoalTarget > 0 ? (allocatedToGoals / openGoalTarget) * 100 : 100,
      openGoalTarget,
      remainingAfterGoalCoverage: Math.max(
        snapshot.availableForGoals - allocatedToGoals,
        0,
      ),
      shortfall: Math.max(openGoalTarget - allocatedToGoals, 0),
    };
  }

  private async getTreasurySnapshot(
    groupId: string,
  ): Promise<TreasurySnapshot> {
    const [group, rows] = await Promise.all([
      this.prisma.group.findUniqueOrThrow({ where: { id: groupId } }),
      this.prisma.treasuryTransaction.groupBy({
        by: ["type"],
        _sum: { amount: true },
        where: { groupId },
      }),
    ]);

    const totals = {
      allocatedToInvestments: 0,
      fees: 0,
      payouts: 0,
      refunds: 0,
      returnedFromInvestments: 0,
      totalContributions: 0,
    };

    for (const row of rows) {
      const amount = this.decimalToNumber(row._sum.amount);
      if (row.type === "CONTRIBUTION") totals.totalContributions += amount;
      if (row.type === "INVESTMENT_ALLOCATION")
        totals.allocatedToInvestments += amount;
      if (row.type === "INVESTMENT_RETURN")
        totals.returnedFromInvestments += amount;
      if (row.type === "PAYOUT") totals.payouts += amount;
      if (row.type === "REFUND") totals.refunds += amount;
      if (row.type === "FEE") totals.fees += amount;
    }

    const lockedBalance = Math.max(
      totals.allocatedToInvestments - totals.returnedFromInvestments,
      0,
    );
    const availableForGoals = Math.max(
      totals.totalContributions +
        totals.returnedFromInvestments -
        totals.allocatedToInvestments -
        totals.payouts -
        totals.refunds -
        totals.fees,
      0,
    );

    return {
      allocatedToInvestments: totals.allocatedToInvestments,
      availableForGoals,
      currency: group.currency,
      grossTreasury: availableForGoals + lockedBalance,
      lockedBalance,
      returnedFromInvestments: totals.returnedFromInvestments,
      totalContributions: totals.totalContributions,
      totalPayouts: totals.payouts,
    };
  }

  private async ensureMember(actorId: string, groupId: string) {
    const member = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: actorId } },
    });

    if (!member) {
      throw new NotFoundException("Milestone goals not found for this member.");
    }

    if (!["ACTIVE", "SUSPENDED"].includes(member.status)) {
      throw new ForbiddenException(
        "Milestone access is not available for this membership status.",
      );
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

  private decimalToNumber(value: unknown) {
    if (!value) return 0;
    if (typeof value === "number") return value;
    if (typeof value === "string") return Number(value);
    if (typeof value === "object" && "toString" in value)
      return Number(value.toString());
    return 0;
  }
}
