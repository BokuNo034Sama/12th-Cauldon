import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { DatabaseModule } from "../database/database.module";
import { TreasuryController } from "./treasury.controller";
import { TreasuryService } from "./treasury.service";

@Module({
  controllers: [TreasuryController],
  exports: [TreasuryService],
  imports: [AuthModule, DatabaseModule],
  providers: [TreasuryService],
})
export class TreasuryModule {}
