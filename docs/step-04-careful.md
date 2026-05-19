# Step 04 Careful Review

Status: complete.

- Production financial schema added for users, groups, members, contributions, investments, votes, treasury transactions, milestones, sessions, OTPs, invites, and audit logs.
- Decimal money fields, UUID identifiers, unique constraints, and high-value indexes added.
- Seed script added at `prisma/seed.ts`.
- Migration execution requires a reachable PostgreSQL database URL.

Careful review notes:

- Ownership percentages are stored but should be recalculated by the treasury engine in Step 08.
- Monetary writes must flow through treasury transactions and audit logs in service code.
- Prisma 7 is installed, but local Node 26 is outside Prisma's supported runtime range; production should use Node 24 LTS or Node 22.12+.
