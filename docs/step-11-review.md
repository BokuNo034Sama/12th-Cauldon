# Step 11 Review - Milestone Goals System

## Scope

- Added a milestones backend module for communal wealth goal creation, progress calculation, treasury allocation visibility, and achievement refresh.
- Added a responsive milestone goals UI with progress rings, allocation summary, and celebration-state readiness.
- Registered the milestones module in the NestJS application.

## Major Decisions

- Reused the existing `MilestoneGoal` model instead of changing the schema because it already supports target amount, due date, and achieved timestamp.
- Treated treasury goal funding as a waterfall allocation across open goals ordered by achievement, due date, and creation date.
- Kept goal creation admin-only while allowing active and suspended members to view progress.
- Returned celebration payloads from the refresh endpoint so Flutter and web clients can render native celebration states later.

## API Surface

- `POST /milestones/goals`
- `GET /milestones/goals?groupId=...`
- `POST /milestones/goals/:goalId/refresh`

## Validation Notes

- Run format, typecheck, lint, and production build after implementation.
- The UI currently uses product-ready placeholder data until authenticated API wiring is added.
