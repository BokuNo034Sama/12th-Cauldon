# 12th Cauldron — Prompt Pack

# Agent Execution Roadmap

## Overview
This document contains the sequenced implementation prompts for building 12th Cauldron.

Execution Rules:
- Complete steps sequentially.
- Do not skip dependency requirements.
- Run required gstack reviews after flagged steps.
- Preserve architecture consistency across all modules.
- Prioritize fintech-grade security and transparency.

---

# [STEP 01] Initialize Monorepo Foundation

## Objective
Create the production-grade Turborepo monorepo foundation.

## Tasks
- Configure Turborepo
- Configure pnpm workspaces
- Setup apps/web
- Setup apps/mobile placeholder
- Configure shared packages
- Configure TypeScript base config
- Configure environment handling

## Expected Output
- Working monorepo
- Shared tsconfig
- Shared lint config
- Shared prettier config

## Folder Targets
```text
/apps
/packages
/tooling
```

## gstack Review
→ After this step: /review

---

# [STEP 02] Setup Next.js Web App

## Objective
Create production-ready Next.js application.

## Tasks
- Install App Router
- Configure Tailwind
- Setup shadcn/ui
- Setup typography
- Configure absolute imports
- Setup route groups

## Expected Output
- Running Next.js app
- Global layout
- Theme setup
- Mobile-first foundation

## Folder Targets
```text
apps/web/app
apps/web/components
```

## Dependencies
Requires STEP 01 complete.

## gstack Review
→ After this step: /qa

---

# [STEP 03] Setup Backend Architecture

## Objective
Initialize NestJS backend services.

## Tasks
- Create NestJS app
- Configure modules
- Setup Prisma
- Configure PostgreSQL connection
- Setup env validation
- Configure logging

## Expected Output
- Running backend server
- Connected database
- Health endpoint

## Folder Targets
```text
backend/src
prisma/
```

## Dependencies
Requires STEP 01 complete.

## gstack Review
→ After this step: /review

---

# [STEP 04] Database Schema & Prisma

## Objective
Implement production-grade financial schema.

## Tasks
- Create Prisma models
- Setup relationships
- Add indexes
- Configure migrations
- Seed initial data

## Expected Output
- Working schema
- Successful migrations
- Seed scripts

## Folder Targets
```text
prisma/schema.prisma
prisma/seed.ts
```

## Dependencies
Requires STEP 03 complete.

## gstack Review
→ After this step: /careful

---

# [STEP 05] Authentication System

## Objective
Build secure auth layer.

## Tasks
- OTP authentication
- JWT session handling
- Role-based permissions
- Invite-only onboarding
- Session middleware

## Expected Output
- Login/signup flow
- Protected routes
- Role guards

## Dependencies
Requires STEP 04 complete.

## gstack Review
→ After this step: /review

---

# [STEP 06] Group Management Module

## Objective
Implement group creation and membership.

## Tasks
- Create groups
- Invite members
- Assign admins
- Configure contribution rules
- Membership status logic

## Expected Output
- Functional group workflows
- Invite system
- Admin permissions

## Dependencies
Requires STEP 05 complete.

## gstack Review
→ After this step: /qa

---

# Context Refresh Prompt

## Paste Into Codex

```text
We are building 12th Cauldron, a collaborative savings and investment platform.

Current progress:
- Monorepo initialized
- Frontend setup complete
- Backend setup complete
- Database configured
- Authentication complete
- Group management complete

Continue implementation while preserving architecture consistency, fintech-grade security, and mobile-first UX.
```

---

# [STEP 07] Contribution Engine

## Objective
Implement recurring contribution workflows.

## Tasks
- Monthly contribution tracking
- Payment recording
- Missed payment detection
- Auto-removal logic
- Contribution history timeline

## Expected Output
- Contribution APIs
- Scheduled checks
- Timeline UI

## Dependencies
Requires STEP 06 complete.

## gstack Review
→ After this step: /careful

---

# [STEP 08] Treasury Engine

## Objective
Build treasury calculation system.

## Tasks
- Ownership percentage calculation
- Locked balance handling
- Withdrawable balance logic
- Treasury transactions
- ROI tracking

## Expected Output
- Treasury services
- Financial calculations
- Ledger history

## Dependencies
Requires STEP 07 complete.

## gstack Review
→ After this step: /review

---

# [STEP 09] Investment Voting System

## Objective
Implement democratic investment voting.

## Tasks
- Proposal creation
- Voting logic
- Ranking engine
- Top 3 selection
- Voting history

## Expected Output
- Voting APIs
- Voting UI
- Result calculations

## Dependencies
Requires STEP 08 complete.

## gstack Review
→ After this step: /qa

---

# [STEP 10] Dashboard & Treasury Visualization

## Objective
Create primary financial dashboard.

## Tasks
- Treasury charts
- Contribution metrics
- ROI cards
- Milestone rings
- Portfolio breakdown

## Expected Output
- Production-grade dashboard
- Responsive charts
- Animated metrics

## Dependencies
Requires STEP 09 complete.

## gstack Review
→ After this step: /qa

---

# [STEP 11] Milestone Goals System

## Objective
Build communal wealth goal tracking.

## Tasks
- Goal creation
- Goal progress engine
- Milestone celebrations
- Treasury allocation visibility

## Expected Output
- Goal tracking system
- Milestone UI
- Celebration states

## Dependencies
Requires STEP 10 complete.

## gstack Review
→ After this step: /review

---

# [STEP 12] Payout & Exit Logic

## Objective
Implement maturity payouts and exits.

## Tasks
- Voluntary exits
- Locked profit logic
- Payout scheduling
- Reinvestment workflows

## Expected Output
- Payout engine
- Exit handling
- Financial state transitions

## Dependencies
Requires STEP 11 complete.

## gstack Review
→ After this step: /careful

---

# [STEP 13] Notifications & Reminders

## Objective
Implement communication systems.

## Tasks
- Payment reminders
- Treasury alerts
- Milestone notifications
- Vote reminders

## Expected Output
- Notification engine
- Email/SMS hooks
- Queue workers

## Dependencies
Requires STEP 12 complete.

## gstack Review
→ After this step: /review

---

# [STEP 14] Security Hardening

## Objective
Apply fintech-grade security.

## Tasks
- Audit logs
- Rate limiting
- API validation
- Secure headers
- Webhook verification
- Encryption checks

## Expected Output
- Hardened backend
- Security middleware
- Audit system

## Dependencies
Requires STEP 13 complete.

## gstack Review
→ After this step: /careful

---

# [STEP 15] Production Deployment

## Objective
Deploy staging and production infrastructure.

## Tasks
- Configure Vercel
- Configure Railway/Fly
- Setup PostgreSQL hosting
- Setup CI/CD
- Configure monitoring

## Expected Output
- Live staging environment
- Production pipeline
- Deployment documentation

## Dependencies
Requires STEP 14 complete.

## gstack Review
→ After this step: /ship

---

# Final Release Checklist

- All tests passing
- Security review complete
- Mobile responsiveness verified
- Treasury calculations verified
- Payout logic verified
- Error logging configured
- Analytics configured
- CI/CD stable
- Staging approved

---

# Future Expansion Packs

## Phase 2
- Land acquisition workflows
- Cooperative legal tooling
- Asset documentation

## Phase 3
- Reputation systems
- Credit scoring
- Lending infrastructure

## Phase 4
- Pan-African rollout
- Embedded banking
- Institutional cooperative onboarding

