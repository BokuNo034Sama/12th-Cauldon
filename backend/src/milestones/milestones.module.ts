import { Module } from "@nestjs/common";

import { DatabaseModule } from "../database/database.module";
import { MilestonesController } from "./milestones.controller";
import { MilestonesService } from "./milestones.service";

@Module({
  controllers: [MilestonesController],
  exports: [MilestonesService],
  imports: [DatabaseModule],
  providers: [MilestonesService],
})
export class MilestonesModule {}
