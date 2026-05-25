import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../database/prisma.service";
import {
  dispatchQueuedNotificationsSchema,
  queueNotificationSchema,
  type DispatchQueuedNotificationsInput,
  type NotificationKind,
  type QueueNotificationInput,
} from "./dto/notifications.dto";
import { SmsProvider } from "./providers/sms.provider";

type NotificationPayload = {
  body: string;
  title: string;
};

type QueueMetadata = {
  body: string;
  channel: "SMS" | "EMAIL";
  groupId: string;
  kind: NotificationKind;
  recipientUserId: string;
  status: "QUEUED";
  title: string;
};

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly smsProvider: SmsProvider,
  ) {}

  async queueNotification(actorId: string, input: QueueNotificationInput) {
    const data = queueNotificationSchema.parse(input);
    await this.ensureGroupAdmin(actorId, data.groupId);
    const recipients = await this.resolveRecipients(
      data.groupId,
      data.recipientUserId,
    );
    const payload = this.renderNotification(data.kind, data.metadata);

    const queued = await Promise.all(
      recipients.map((recipient) =>
        this.prisma.auditLog.create({
          data: {
            action: "notifications.queued",
            actorId,
            target: `user:${recipient.userId}`,
            metadata: {
              body: payload.body,
              channel: data.channel,
              groupId: data.groupId,
              kind: data.kind,
              recipientUserId: recipient.userId,
              status: "QUEUED",
              title: payload.title,
            } satisfies QueueMetadata,
          },
        }),
      ),
    );

    return {
      count: queued.length,
      notifications: queued,
    };
  }

  async dispatchQueuedNotifications(
    actorId: string,
    input: DispatchQueuedNotificationsInput,
  ) {
    const data = dispatchQueuedNotificationsSchema.parse(input);
    if (data.groupId) await this.ensureGroupAdmin(actorId, data.groupId);

    const queued = await this.prisma.auditLog.findMany({
      orderBy: { createdAt: "asc" },
      take: data.limit,
      where: {
        action: "notifications.queued",
        metadata: data.groupId
          ? {
              path: ["groupId"],
              equals: data.groupId,
            }
          : undefined,
      },
    });
    const results = [];

    for (const item of queued) {
      const metadata = this.asQueueMetadata(item.metadata);
      if (!metadata || metadata.status !== "QUEUED") continue;

      const recipient = await this.prisma.user.findUnique({
        select: { phone: true },
        where: { id: metadata.recipientUserId },
      });

      if (!recipient) {
        results.push(await this.markFailed(item.id, "Recipient not found."));
        continue;
      }

      if (metadata.channel !== "SMS") {
        results.push(await this.markFailed(item.id, "Email is not wired yet."));
        continue;
      }

      try {
        const delivery = await this.smsProvider.send({
          body: metadata.body,
          to: recipient.phone,
        });
        results.push(
          await this.prisma.auditLog.create({
            data: {
              action: "notifications.dispatched",
              actorId,
              target: item.target,
              metadata: {
                ...metadata,
                delivery: {
                  externalId: delivery.externalId,
                  provider: delivery.provider,
                  status: delivery.status,
                },
                queuedNotificationId: item.id,
                status: "SENT",
              },
            },
          }),
        );
      } catch (error) {
        results.push(
          await this.markFailed(
            item.id,
            error instanceof Error ? error.message : "SMS delivery failed.",
          ),
        );
      }
    }

    return {
      attempted: queued.length,
      results,
    };
  }

  async queuePaymentReminders(actorId: string, groupId: string) {
    await this.ensureGroupAdmin(actorId, groupId);
    const pending = await this.prisma.contribution.findMany({
      include: { user: true },
      where: {
        groupId,
        status: { in: ["PENDING", "MISSED"] },
      },
    });

    const queued = await Promise.all(
      pending.map((contribution) =>
        this.queueNotification(actorId, {
          channel: "SMS",
          groupId,
          kind: "PAYMENT_REMINDER",
          metadata: {
            amount: this.decimalToNumber(contribution.amount),
            dueAt: contribution.dueAt.toISOString(),
          },
          recipientUserId: contribution.userId,
        }),
      ),
    );

    return {
      count: queued.reduce((sum, item) => sum + item.count, 0),
      reminders: queued.flatMap((item) => item.notifications),
    };
  }

  async queueVoteReminders(actorId: string, proposalId: string) {
    const proposal = await this.prisma.investmentProposal.findUnique({
      include: { votes: true },
      where: { id: proposalId },
    });

    if (!proposal) {
      throw new NotFoundException("Investment proposal not found.");
    }

    await this.ensureGroupAdmin(actorId, proposal.groupId);
    const votedUserIds = new Set(proposal.votes.map((vote) => vote.userId));
    const members = await this.prisma.groupMember.findMany({
      where: {
        groupId: proposal.groupId,
        status: "ACTIVE",
        userId: { notIn: [...votedUserIds] },
      },
    });

    const queued = await Promise.all(
      members.map((member) =>
        this.queueNotification(actorId, {
          channel: "SMS",
          groupId: proposal.groupId,
          kind: "VOTE_REMINDER",
          metadata: {
            proposalTitle: proposal.title,
            votingEndsAt: proposal.votingEndsAt.toISOString(),
          },
          recipientUserId: member.userId,
        }),
      ),
    );

    return {
      count: queued.reduce((sum, item) => sum + item.count, 0),
      reminders: queued.flatMap((item) => item.notifications),
    };
  }

  private renderNotification(
    kind: NotificationKind,
    metadata: Record<string, unknown> = {},
  ): NotificationPayload {
    if (kind === "PAYMENT_REMINDER") {
      return {
        body: `12th Cauldron: Your contribution of ${metadata.amount ?? "the scheduled amount"} is due. Please pay to keep your group current.`,
        title: "Payment reminder",
      };
    }

    if (kind === "TREASURY_ALERT") {
      return {
        body: `12th Cauldron treasury alert: ${metadata.summary ?? "A treasury event needs review."}`,
        title: "Treasury alert",
      };
    }

    if (kind === "MILESTONE_UPDATE") {
      return {
        body: `12th Cauldron milestone update: ${metadata.goalName ?? "A goal"} is now ${metadata.progress ?? "moving"} toward completion.`,
        title: "Milestone update",
      };
    }

    return {
      body: `12th Cauldron vote reminder: ${metadata.proposalTitle ?? "An investment proposal"} is awaiting your vote.`,
      title: "Vote reminder",
    };
  }

  private async resolveRecipients(groupId: string, recipientUserId?: string) {
    const members = await this.prisma.groupMember.findMany({
      where: {
        groupId,
        status: "ACTIVE",
        userId: recipientUserId,
      },
    });

    if (recipientUserId && members.length === 0) {
      throw new NotFoundException("Recipient is not an active group member.");
    }

    return members;
  }

  private async ensureGroupAdmin(actorId: string, groupId: string) {
    const member = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: actorId } },
    });

    if (!member || !member.isAdmin || member.status !== "ACTIVE") {
      throw new ForbiddenException("Group admin permissions are required.");
    }

    return member;
  }

  private async markFailed(queuedNotificationId: string, reason: string) {
    return this.prisma.auditLog.create({
      data: {
        action: "notifications.failed",
        target: `notification:${queuedNotificationId}`,
        metadata: {
          queuedNotificationId,
          reason,
          status: "FAILED",
        },
      },
    });
  }

  private asQueueMetadata(metadata: unknown): QueueMetadata | undefined {
    if (!metadata || typeof metadata !== "object") return undefined;
    const record = metadata as Partial<QueueMetadata>;

    if (
      typeof record.body !== "string" ||
      typeof record.groupId !== "string" ||
      typeof record.kind !== "string" ||
      typeof record.recipientUserId !== "string" ||
      typeof record.title !== "string"
    ) {
      return undefined;
    }

    return record as QueueMetadata;
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
