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
import type { CreateMilestoneGoalInput } from "./dto/milestones.dto";
import { MilestonesService } from "./milestones.service";

type AuthenticatedRequest = {
  user: {
    sub: string;
  };
};

@UseGuards(JwtAuthGuard)
@Controller("milestones")
export class MilestonesController {
  constructor(private readonly milestonesService: MilestonesService) {}

  @Post("goals")
  createGoal(
    @Req() request: AuthenticatedRequest,
    @Body() body: CreateMilestoneGoalInput,
  ) {
    return this.milestonesService.createGoal(request.user.sub, body);
  }

  @Get("goals")
  listGoals(
    @Req() request: AuthenticatedRequest,
    @Query("groupId") groupId: string,
  ) {
    return this.milestonesService.listGoals(request.user.sub, { groupId });
  }

  @Post("goals/:goalId/refresh")
  refreshGoal(
    @Req() request: AuthenticatedRequest,
    @Param("goalId") goalId: string,
  ) {
    return this.milestonesService.refreshGoal(request.user.sub, goalId);
  }
}
