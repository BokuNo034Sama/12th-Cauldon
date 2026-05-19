import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";

import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ContributionsService } from "./contributions.service";
import type { RecordContributionInput } from "./dto/contributions.dto";

type AuthenticatedRequest = {
  user: {
    sub: string;
  };
};

@UseGuards(JwtAuthGuard)
@Controller("contributions")
export class ContributionsController {
  constructor(private readonly contributionsService: ContributionsService) {}

  @Post()
  recordContribution(
    @Req() request: AuthenticatedRequest,
    @Body() body: RecordContributionInput,
  ) {
    return this.contributionsService.recordContribution(request.user.sub, body);
  }

  @Get("history")
  getHistory(
    @Req() request: AuthenticatedRequest,
    @Query("groupId") groupId?: string,
  ) {
    return this.contributionsService.getHistory(request.user.sub, groupId);
  }

  @Post("process-missed")
  processMissedContributions() {
    return this.contributionsService.processMissedContributions();
  }
}
