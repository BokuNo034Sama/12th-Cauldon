import { PrismaPg } from "@prisma/adapter-pg";
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { PrismaClient } from "../generated/prisma/client";
import type { BackendEnv } from "../config/env.schema";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly configService: ConfigService<BackendEnv, true>) {
    const adapter = new PrismaPg({
      connectionString: configService.get("DATABASE_URL", { infer: true }),
    });
    super({ adapter });
  }

  async onModuleInit() {
    this.logger.log("Connecting Prisma client");
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
