import {
  Body,
  Controller,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";

import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import type {
  DispatchQueuedNotificationsInput,
  QueueNotificationInput,
} from "./dto/notifications.dto";
import { NotificationsService } from "./notifications.service";

type AuthenticatedRequest = {
  user: {
    sub: string;
  };
};

@UseGuards(JwtAuthGuard)
@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post("queue")
  queueNotification(
    @Req() request: AuthenticatedRequest,
    @Body() body: QueueNotificationInput,
  ) {
    return this.notificationsService.queueNotification(request.user.sub, body);
  }

  @Post("dispatch")
  dispatchQueuedNotifications(
    @Req() request: AuthenticatedRequest,
    @Body() body: DispatchQueuedNotificationsInput,
  ) {
    return this.notificationsService.dispatchQueuedNotifications(
      request.user.sub,
      body,
    );
  }

  @Post("groups/:groupId/payment-reminders")
  queuePaymentReminders(
    @Req() request: AuthenticatedRequest,
    @Param("groupId") groupId: string,
  ) {
    return this.notificationsService.queuePaymentReminders(
      request.user.sub,
      groupId,
    );
  }

  @Post("proposals/:proposalId/vote-reminders")
  queueVoteReminders(
    @Req() request: AuthenticatedRequest,
    @Param("proposalId") proposalId: string,
  ) {
    return this.notificationsService.queueVoteReminders(
      request.user.sub,
      proposalId,
    );
  }

  @Post("groups/:groupId/treasury-alert")
  queueTreasuryAlert(
    @Req() request: AuthenticatedRequest,
    @Param("groupId") groupId: string,
    @Query("summary") summary?: string,
  ) {
    return this.notificationsService.queueNotification(request.user.sub, {
      channel: "SMS",
      groupId,
      kind: "TREASURY_ALERT",
      metadata: { summary },
    });
  }
}
