import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { DatabaseModule } from "../database/database.module";
import { GroupsController } from "./groups.controller";
import { GroupsService } from "./groups.service";

@Module({
  controllers: [GroupsController],
  exports: [GroupsService],
  imports: [AuthModule, DatabaseModule],
  providers: [GroupsService],
})
export class GroupsModule {}
