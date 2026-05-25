import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";

import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import type {
  ExecuteMaturityPayoutsInput,
  ReinvestProfitInput,
  VoluntaryExitInput,
} from "./dto/payouts.dto";
import { PayoutsService } from "./payouts.service";

type AuthenticatedRequest = {
  user: {
    sub: string;
  };
};

@UseGuards(JwtAuthGuard)
@Controller("payouts")
export class PayoutsController {
  constructor(private readonly payoutsService: PayoutsService) {}

  @Get("schedule")
  previewSchedule(
    @Req() request: AuthenticatedRequest,
    @Query("groupId") groupId: string,
  ) {
    return this.payoutsService.previewSchedule(request.user.sub, { groupId });
  }

  @Post("groups/:groupId/voluntary-exit")
  requestVoluntaryExit(
    @Req() request: AuthenticatedRequest,
    @Param("groupId") groupId: string,
    @Body() body: VoluntaryExitInput,
  ) {
    return this.payoutsService.requestVoluntaryExit(
      request.user.sub,
      groupId,
      body,
    );
  }

  @Post("maturity/execute")
  executeMaturityPayouts(
    @Req() request: AuthenticatedRequest,
    @Body() body: ExecuteMaturityPayoutsInput,
  ) {
    return this.payoutsService.executeMaturityPayouts(request.user.sub, body);
  }

  @Post("reinvest")
  reinvestProfit(
    @Req() request: AuthenticatedRequest,
    @Body() body: ReinvestProfitInput,
  ) {
    return this.payoutsService.reinvestProfit(request.user.sub, body);
  }
}
