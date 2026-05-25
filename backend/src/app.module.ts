import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AuthModule } from "./auth/auth.module";
import { validateEnv } from "./config/validate-env";
import { ContributionsModule } from "./contributions/contributions.module";
import { DatabaseModule } from "./database/database.module";
import { GroupsModule } from "./groups/groups.module";
import { HealthModule } from "./health/health.module";
import { InvestmentsModule } from "./investments/investments.module";
import { MilestonesModule } from "./milestones/milestones.module";
import { TreasuryModule } from "./treasury/treasury.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      validate: validateEnv,
    }),
    DatabaseModule,
    AuthModule,
    ContributionsModule,
    GroupsModule,
    TreasuryModule,
    InvestmentsModule,
    MilestonesModule,
    HealthModule,
  ],
})
export class AppModule {}
