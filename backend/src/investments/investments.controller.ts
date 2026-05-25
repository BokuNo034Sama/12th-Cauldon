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
  CreateProposalInput,
  VoteOnProposalInput,
} from "./dto/investments.dto";
import { InvestmentsService } from "./investments.service";

type AuthenticatedRequest = {
  user: {
    sub: string;
  };
};

@UseGuards(JwtAuthGuard)
@Controller("investments")
export class InvestmentsController {
  constructor(private readonly investmentsService: InvestmentsService) {}

  @Post("proposals")
  createProposal(
    @Req() request: AuthenticatedRequest,
    @Body() body: CreateProposalInput,
  ) {
    return this.investmentsService.createProposal(request.user.sub, body);
  }

  @Get("proposals")
  listProposals(
    @Req() request: AuthenticatedRequest,
    @Query("groupId") groupId: string,
    @Query("status") status?: string,
  ) {
    return this.investmentsService.listProposals(request.user.sub, {
      groupId,
      status,
    });
  }

  @Post("proposals/:proposalId/vote")
  vote(
    @Req() request: AuthenticatedRequest,
    @Param("proposalId") proposalId: string,
    @Body() body: VoteOnProposalInput,
  ) {
    return this.investmentsService.vote(request.user.sub, proposalId, body);
  }

  @Get("rankings")
  getRankings(
    @Req() request: AuthenticatedRequest,
    @Query("groupId") groupId: string,
  ) {
    return this.investmentsService.getRankings(request.user.sub, groupId);
  }

  @Post("groups/:groupId/finalize-top-three")
  finalizeTopThree(
    @Req() request: AuthenticatedRequest,
    @Param("groupId") groupId: string,
  ) {
    return this.investmentsService.finalizeTopThree(request.user.sub, groupId);
  }

  @Get("votes/history")
  getVotingHistory(
    @Req() request: AuthenticatedRequest,
    @Query("groupId") groupId: string,
  ) {
    return this.investmentsService.getVotingHistory(request.user.sub, groupId);
  }
}
