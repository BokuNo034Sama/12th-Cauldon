# Step 12 Careful Review - Payout & Exit Logic

## Scope

- Added a payouts backend module for maturity schedules, voluntary exits, maturity payout execution, and profit reinvestment.
- Added locked-profit calculations from investment returns and member ownership.
- Added a payout and exit UI at `/payouts`.

## Major Decisions

- Used `TreasuryTransaction` plus structured metadata for payout events instead of adding a schema migration at this step.
- Kept voluntary exits conservative: members can withdraw unpaid principal, while investment profit remains locked until maturity or reinvestment.
- Recorded payout/reinvestment workflows through audit logs and transaction metadata for future reconciliation.
- Used admin-only maturity execution and member-owned reinvestment flows.

## API Surface

- `GET /payouts/schedule?groupId=...`
- `POST /payouts/groups/:groupId/voluntary-exit`
- `POST /payouts/maturity/execute`
- `POST /payouts/reinvest`

## Remaining Risk

- Real payment rails, bank account storage, payout approval queues, and idempotency keys should be added before production money movement.
- The current schedule engine is deterministic from treasury state, but a later migration should add durable payout schedule rows once requirements for approvals and provider reconciliation are finalized.
