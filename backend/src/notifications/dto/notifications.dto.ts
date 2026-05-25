import { z } from "zod";

export const notificationKindSchema = z.enum([
  "PAYMENT_REMINDER",
  "TREASURY_ALERT",
  "MILESTONE_UPDATE",
  "VOTE_REMINDER",
]);

export const notificationChannelSchema = z.enum(["SMS", "EMAIL"]);

export const queueNotificationSchema = z.object({
  channel: notificationChannelSchema.default("SMS"),
  groupId: z.string().uuid(),
  kind: notificationKindSchema,
  metadata: z.record(z.string(), z.unknown()).optional(),
  recipientUserId: z.string().uuid().optional(),
});

export const dispatchQueuedNotificationsSchema = z.object({
  groupId: z.string().uuid().optional(),
  limit: z.coerce.number().int().positive().max(100).default(25),
});

export type QueueNotificationInput = z.input<typeof queueNotificationSchema>;
export type DispatchQueuedNotificationsInput = z.input<
  typeof dispatchQueuedNotificationsSchema
>;
export type NotificationKind = z.infer<typeof notificationKindSchema>;
export type NotificationChannel = z.infer<typeof notificationChannelSchema>;
