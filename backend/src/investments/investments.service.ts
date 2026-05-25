import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../database/prisma.service";
import {
  createProposalSchema,
  listProposalsSchema,
  voteOnProposalSchema,
  type CreateProposalInput,
  type ListProposalsInput,
  type VoteOnProposalInput,
} from "./dto/investments.dto";

@Injectable()
export class InvestmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createProposal(actorId: string, input: CreateProposalInput) {
    const data = createProposalSchema.parse(input);
    await this.ensureActiveMember(actorId, data.groupId);

    return this.prisma.investmentProposal.create({
      data: {
        groupId: data.groupId,
        status: "VOTING",
        summary: data.summary,
        title: data.title,
        votingEndsAt: data.votingEndsAt,
      },
    });
  }

  async listProposals(actorId: string, input: ListProposalsInput) {
    const data = listProposalsSchema.parse(input);
    await this.ensureActiveMember(actorId, data.groupId);

    return this.prisma.investmentProposal.findMany({
      include: {
        _count: { select: { votes: true } },
        votes: true,
      },
      orderBy: { createdAt: "desc" },
      where: {
        groupId: data.groupId,
        status: data.status,
      },
    });
  }

  async vote(actorId: string, proposalId: string, input: VoteOnProposalInput) {
    const data = voteOnProposalSchema.parse(input);
    const proposal = await this.prisma.investmentProposal.findUnique({
      where: { id: proposalId },
    });

    if (!proposal) {
      throw new NotFoundException("Investment proposal not found.");
    }

    await this.ensureActiveMember(actorId, proposal.groupId);

    if (proposal.votingEndsAt < new Date()) {
      throw new ForbiddenException("Voting has closed for this proposal.");
    }

    return this.prisma.vote.upsert({
      create: {
        proposalId,
        userId: actorId,
        vote: data.vote,
      },
      update: { vote: data.vote },
      where: {
        proposalId_userId: {
          proposalId,
          userId: actorId,
        },
      },
    });
  }

  async getRankings(actorId: string, groupId: string) {
    await this.ensureActiveMember(actorId, groupId);
    const proposals = await this.prisma.investmentProposal.findMany({
      include: { votes: true },
      where: {
        groupId,
        status: "VOTING",
      },
    });

    return proposals
      .map((proposal) => {
        const approvals = proposal.votes.filter(
          (vote) => vote.vote === "APPROVE",
        ).length;
        const rejections = proposal.votes.filter(
          (vote) => vote.vote === "REJECT",
        ).length;
        return {
          approvals,
          proposalId: proposal.id,
          rejections,
          score: approvals - rejections,
          title: proposal.title,
          totalVotes: proposal.votes.length,
        };
      })
      .sort((a, b) => b.score - a.score || b.approvals - a.approvals)
      .slice(0, 3);
  }

  async finalizeTopThree(actorId: string, groupId: string) {
    await this.ensureGroupAdmin(actorId, groupId);
    const rankings = await this.getRankings(actorId, groupId);
    const selectedIds = rankings.map((ranking) => ranking.proposalId);

    await this.prisma.investmentProposal.updateMany({
      data: { status: "SELECTED" },
      where: { id: { in: selectedIds } },
    });

    await this.prisma.investmentProposal.updateMany({
      data: { status: "CANCELLED" },
      where: {
        groupId,
        id: { notIn: selectedIds },
        status: "VOTING",
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: "investments.finalize_top_three",
        actorId,
        target: `group:${groupId}`,
        metadata: { selectedIds },
      },
    });

    return { selectedIds, topThree: rankings };
  }

  async getVotingHistory(actorId: string, groupId: string) {
    await this.ensureActiveMember(actorId, groupId);

    return this.prisma.vote.findMany({
      include: {
        proposal: true,
        user: { select: { fullName: true, id: true } },
      },
      orderBy: { createdAt: "desc" },
      where: {
        proposal: { groupId },
      },
    });
  }

  private async ensureActiveMember(actorId: string, groupId: string) {
    const member = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: actorId } },
    });

    if (!member || member.status !== "ACTIVE") {
      throw new ForbiddenException("Active group membership is required.");
    }

    return member;
  }

  private async ensureGroupAdmin(actorId: string, groupId: string) {
    const member = await this.ensureActiveMember(actorId, groupId);

    if (!member.isAdmin) {
      throw new ForbiddenException("Group admin permissions are required.");
    }

    return member;
  }
}
