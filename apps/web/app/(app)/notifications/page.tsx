import {
  BellRing,
  CheckCircle2,
  Clock3,
  MessageSquareText,
  Send,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const reminders = [
  {
    channel: "SMS",
    count: "42 queued",
    label: "Payment reminders",
    status: "Ready",
  },
  {
    channel: "SMS",
    count: "11 pending voters",
    label: "Vote reminders",
    status: "Ready",
  },
  {
    channel: "SMS",
    count: "3 active goals",
    label: "Milestone updates",
    status: "Template",
  },
  {
    channel: "SMS",
    count: "Treasury admins",
    label: "Treasury alerts",
    status: "Template",
  },
];

const queueRows = [
  ["Provider", "Termii"],
  ["Local fallback", "Mock SMS"],
  ["Dispatch mode", "Queue worker-ready"],
  ["Audit trail", "AuditLog metadata"],
];

export default function NotificationsPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Communication systems
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">
              Notifications and reminders
            </h1>
          </div>
          <Button>
            <Send aria-hidden="true" />
            Dispatch queue
          </Button>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          {[
            ["SMS provider", "Termii"],
            ["Queued events", "56"],
            ["Delivery mode", "Provider-ready"],
            ["Templates", "4"],
          ].map(([label, value]) => (
            <article
              key={label}
              className="rounded-lg border bg-card p-5 shadow-xs"
            >
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-3 text-2xl font-semibold">{value}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <article className="rounded-lg border bg-card p-5 shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Reminder workflows</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Queue-ready notification paths for financial operations.
                </p>
              </div>
              <BellRing className="size-5 text-primary" aria-hidden="true" />
            </div>
            <div className="mt-5 grid gap-3">
              {reminders.map((reminder) => (
                <div
                  key={reminder.label}
                  className="grid gap-3 rounded-lg border bg-background p-4 sm:grid-cols-[1fr_auto_auto] sm:items-center"
                >
                  <div>
                    <p className="font-medium">{reminder.label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {reminder.channel} channel
                    </p>
                  </div>
                  <span className="text-sm font-medium">{reminder.count}</span>
                  <span className="inline-flex items-center gap-2 rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                    <CheckCircle2 className="size-3.5" />
                    {reminder.status}
                  </span>
                </div>
              ))}
            </div>
          </article>

          <aside className="flex flex-col gap-5">
            <section className="rounded-lg border bg-card p-5 shadow-xs">
              <p className="flex items-center gap-2 text-sm font-medium text-primary">
                <MessageSquareText className="size-4" aria-hidden="true" />
                SMS hooks
              </p>
              <h2 className="mt-3 text-lg font-semibold">Termii adapter</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                SMS delivery is routed through a provider interface with mock
                delivery for local development and Termii for production.
              </p>
              <div className="mt-5 grid gap-3">
                {queueRows.map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-lg bg-background px-3 py-2 text-sm"
                  >
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border bg-card p-5 shadow-xs">
              <p className="flex items-center gap-2 text-sm font-medium text-primary">
                <Clock3 className="size-4" aria-hidden="true" />
                Worker shape
              </p>
              <h2 className="mt-3 text-lg font-semibold">Dispatch later</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Queued notification records can be dispatched by a cron worker
                or background queue once infrastructure is selected.
              </p>
              <div className="mt-5 rounded-lg border bg-background p-4">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <ShieldCheck className="size-4 text-primary" />
                  Secrets remain environment-only
                </p>
              </div>
            </section>
          </aside>
        </section>
      </section>
    </main>
  );
}
