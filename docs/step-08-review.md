# Step 08 Review

Status: complete.

- Treasury summary endpoint added at `GET /treasury?groupId=...`.
- Treasury transaction history endpoint added at `GET /treasury/transactions`.
- Ownership percentage calculation added from paid contributions.
- Locked and withdrawable balance logic added from treasury transaction types.
- ROI tracking added from investment allocations and returns.
- Ownership recalculation endpoint added at `POST /treasury/:groupId/recalculate-ownership`.

Review notes:

- Treasury calculations are derived from ledger-style `TreasuryTransaction` rows.
- Contribution writes already create `CONTRIBUTION` treasury rows.
- Investment allocation and return rows will be produced by the Step 09 voting/investment workflow and Step 12 payout workflow.
