import {
  CheckCircle2,
  CircleDollarSign,
  Flag,
  Plus,
  Sparkles,
  Target,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const goals = [
  {
    amount: "NGN 6.6M",
    due: "Jul 2026",
    gap: "NGN 1.4M remaining",
    name: "Reserve floor",
    progress: 82,
    status: "On track",
  },
  {
    amount: "NGN 9.8M",
    due: "Sep 2026",
    gap: "NGN 3.5M remaining",
    name: "Q3 deployment pool",
    progress: 64,
    status: "Needs funding",
  },
  {
    amount: "NGN 3.1M",
    due: "Oct 2026",
    gap: "NGN 1.6M remaining",
    name: "Member liquidity buffer",
    progress: 47,
    status: "Building",
  },
];

const allocationRows = [
  ["Available for goals", "NGN 8.2M"],
  ["Open goal target", "NGN 19.5M"],
  ["Coverage ratio", "42%"],
  ["Projected shortfall", "NGN 11.3M"],
];

export default function MilestonesPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Goal tracking
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">
              Milestone goals
            </h1>
          </div>
          <Button>
            <Plus aria-hidden="true" />
            Create goal
          </Button>
        </header>

        <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-4">
            {goals.map((goal) => (
              <article
                key={goal.name}
                className="rounded-lg border bg-card p-5 shadow-xs"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="flex items-center gap-2 text-sm font-medium text-primary">
                      <Target className="size-4" aria-hidden="true" />
                      {goal.status}
                    </p>
                    <h2 className="mt-3 text-xl font-semibold">{goal.name}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Target {goal.amount} by {goal.due}
                    </p>
                  </div>
                  <div
                    className="grid size-24 shrink-0 place-items-center rounded-full"
                    style={{
                      background: `conic-gradient(#0f766e ${goal.progress}%, #e2e8f0 0)`,
                    }}
                  >
                    <div className="grid size-16 place-items-center rounded-full bg-card">
                      <span className="text-lg font-semibold">
                        {goal.progress}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-5 h-3 rounded-full bg-muted">
                  <div
                    className="h-3 rounded-full bg-primary"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
                <div className="mt-4 flex flex-col gap-3 border-t pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-muted-foreground">{goal.gap}</span>
                  <Button variant="outline" size="sm">
                    <Flag aria-hidden="true" />
                    Refresh progress
                  </Button>
                </div>
              </article>
            ))}
          </div>

          <aside className="flex flex-col gap-5">
            <section className="rounded-lg border bg-card p-5 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Treasury allocation</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Visibility into goal funding coverage.
                  </p>
                </div>
                <CircleDollarSign
                  className="size-5 text-primary"
                  aria-hidden="true"
                />
              </div>
              <div className="mt-5 grid gap-3">
                {allocationRows.map(([label, value]) => (
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
                <Sparkles className="size-4" aria-hidden="true" />
                Celebration state
              </p>
              <h2 className="mt-3 text-lg font-semibold">
                Reserve floor is close
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                When a goal reaches full coverage, the backend records
                achievedAt and returns a celebration payload for the client.
              </p>
              <div className="mt-5 rounded-lg border bg-background p-4">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <CheckCircle2 className="size-4 text-primary" />
                  Ready for achievement banner
                </p>
              </div>
            </section>
          </aside>
        </section>
      </section>
    </main>
  );
}
