import { Module } from "@nestjs/common";

import { DatabaseModule } from "../database/database.module";
import { PayoutsController } from "./payouts.controller";
import { PayoutsService } from "./payouts.service";

@Module({
  controllers: [PayoutsController],
  exports: [PayoutsService],
  imports: [DatabaseModule],
  providers: [PayoutsService],
})
export class PayoutsModule {}
