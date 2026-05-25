import { Module } from "@nestjs/common";

import { DatabaseModule } from "../database/database.module";
import { NotificationsController } from "./notifications.controller";
import { NotificationsService } from "./notifications.service";
import { SmsProvider } from "./providers/sms.provider";

@Module({
  controllers: [NotificationsController],
  exports: [NotificationsService],
  imports: [DatabaseModule],
  providers: [NotificationsService, SmsProvider],
})
export class NotificationsModule {}
