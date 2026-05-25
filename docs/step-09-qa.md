# Step 09 QA

Status: complete.

- Investment proposal creation endpoint added.
- Proposal listing endpoint added.
- Vote endpoint added with one vote per user per proposal.
- Ranking engine added with top-three selection.
- Voting history endpoint added.
- Basic web voting surface added at `/investments`.

QA notes:

- Only active group members can create proposals and vote.
- Only group admins can finalize top-three selections.
- Investment allocation into treasury transactions remains part of the later investment execution/payout flow.
