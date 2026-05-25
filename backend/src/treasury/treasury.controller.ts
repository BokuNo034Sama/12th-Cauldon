import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";

import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TreasuryService } from "./treasury.service";

type AuthenticatedRequest = {
  user: {
    sub: string;
  };
};

@UseGuards(JwtAuthGuard)
@Controller("treasury")
export class TreasuryController {
  constructor(private readonly treasuryService: TreasuryService) {}

  @Get()
  getSummary(
    @Req() request: AuthenticatedRequest,
    @Query("groupId") groupId: string,
  ) {
    return this.treasuryService.getSummary(request.user.sub, { groupId });
  }

  @Get("transactions")
  getTransactions(
    @Req() request: AuthenticatedRequest,
    @Query("groupId") groupId: string,
    @Query("type") type?: string,
    @Query("limit") limit?: string,
  ) {
    return this.treasuryService.getTransactions(request.user.sub, {
      groupId,
      limit,
      type,
    });
  }

  @Post(":groupId/recalculate-ownership")
  recalculateOwnership(
    @Req() request: AuthenticatedRequest,
    @Param("groupId") groupId: string,
  ) {
    return this.treasuryService.recalculateOwnership(request.user.sub, groupId);
  }
}
