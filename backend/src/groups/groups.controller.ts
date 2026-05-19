import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";

import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import type {
  CreateGroupInput,
  InviteMemberInput,
  UpdateContributionRulesInput,
  UpdateMemberAdminInput,
  UpdateMemberStatusInput,
} from "./dto/groups.dto";
import { GroupsService } from "./groups.service";

type AuthenticatedRequest = {
  user: {
    sub: string;
  };
};

@UseGuards(JwtAuthGuard)
@Controller("groups")
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  createGroup(
    @Req() request: AuthenticatedRequest,
    @Body() body: CreateGroupInput,
  ) {
    return this.groupsService.createGroup(request.user.sub, body);
  }

  @Get(":groupId")
  getGroup(
    @Req() request: AuthenticatedRequest,
    @Param("groupId") groupId: string,
  ) {
    return this.groupsService.getGroup(request.user.sub, groupId);
  }

  @Post(":groupId/invites")
  inviteMember(
    @Req() request: AuthenticatedRequest,
    @Param("groupId") groupId: string,
    @Body() body: InviteMemberInput,
  ) {
    return this.groupsService.inviteMember(request.user.sub, groupId, body);
  }

  @Patch(":groupId/contribution-rules")
  updateContributionRules(
    @Req() request: AuthenticatedRequest,
    @Param("groupId") groupId: string,
    @Body() body: UpdateContributionRulesInput,
  ) {
    return this.groupsService.updateContributionRules(
      request.user.sub,
      groupId,
      body,
    );
  }

  @Patch(":groupId/members/:memberId/admin")
  updateMemberAdmin(
    @Req() request: AuthenticatedRequest,
    @Param("groupId") groupId: string,
    @Param("memberId") memberId: string,
    @Body() body: UpdateMemberAdminInput,
  ) {
    return this.groupsService.updateMemberAdmin(
      request.user.sub,
      groupId,
      memberId,
      body,
    );
  }

  @Patch(":groupId/members/:memberId/status")
  updateMemberStatus(
    @Req() request: AuthenticatedRequest,
    @Param("groupId") groupId: string,
    @Param("memberId") memberId: string,
    @Body() body: UpdateMemberStatusInput,
  ) {
    return this.groupsService.updateMemberStatus(
      request.user.sub,
      groupId,
      memberId,
      body,
    );
  }
}
