import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { DatabaseModule } from "../database/database.module";
import { InvestmentsController } from "./investments.controller";
import { InvestmentsService } from "./investments.service";

@Module({
  controllers: [InvestmentsController],
  exports: [InvestmentsService],
  imports: [AuthModule, DatabaseModule],
  providers: [InvestmentsService],
})
export class InvestmentsModule {}
