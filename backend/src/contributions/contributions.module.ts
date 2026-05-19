import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { DatabaseModule } from "../database/database.module";
import { ContributionsController } from "./contributions.controller";
import { ContributionsService } from "./contributions.service";

@Module({
  controllers: [ContributionsController],
  exports: [ContributionsService],
  imports: [AuthModule, DatabaseModule],
  providers: [ContributionsService],
})
export class ContributionsModule {}
