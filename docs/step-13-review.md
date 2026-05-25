# Step 13 Review - Notifications & Reminders

## Scope

- Added a notification engine for payment reminders, treasury alerts, milestone updates, and vote reminders.
- Added queue-ready notification records using `AuditLog` metadata.
- Added SMS provider abstraction with mock mode and Termii delivery.
- Added a notifications operations UI at `/notifications`.

## Major Decisions

- Kept SMS delivery behind `SmsProvider` so Flutter, web, workers, and future providers can share the same contract.
- Used `SMS_PROVIDER=mock` as the default to avoid accidental live SMS in local development.
- Added Termii configuration through environment variables only; no API key is stored in source.
- Used audit logs as the queue substrate for this step, with a clear path to move to a durable queue table or job worker later.

## API Surface

- `POST /notifications/queue`
- `POST /notifications/dispatch`
- `POST /notifications/groups/:groupId/payment-reminders`
- `POST /notifications/proposals/:proposalId/vote-reminders`
- `POST /notifications/groups/:groupId/treasury-alert`

## Termii Configuration

- `SMS_PROVIDER=termii`
- `TERMII_API_KEY=...`
- `SMS_SENDER_ID=12Cauldron`
- `SMS_CHANNEL=generic`
- `TERMII_BASE_URL=https://api.ng.termii.com`

## Remaining Risk

- Email hooks are represented at the DTO/channel layer but intentionally fail dispatch until an email provider is selected.
- A production queue such as BullMQ, Cloud Tasks, or a managed cron runner should replace manual dispatch before high-volume sending.
