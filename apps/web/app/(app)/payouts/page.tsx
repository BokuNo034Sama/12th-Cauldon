import {
  ArrowRightLeft,
  CalendarClock,
  CheckCircle2,
  DoorOpen,
  Landmark,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const payoutRows = [
  {
    lockedProfit: "NGN 480K",
    maturity: "NGN 2.48M",
    member: "Amina Yusuf",
    ownership: "12.4%",
    principal: "NGN 2.0M",
    status: "Active",
  },
  {
    lockedProfit: "NGN 360K",
    maturity: "NGN 1.86M",
    member: "Tayo Bello",
    ownership: "9.3%",
    principal: "NGN 1.5M",
    status: "Active",
  },
  {
    lockedProfit: "NGN 210K",
    maturity: "NGN 1.09M",
    member: "Chioma Okoye",
    ownership: "5.4%",
    principal: "NGN 880K",
    status: "Exit-ready",
  },
];

const stateCards = [
  {
    icon: Landmark,
    label: "Withdrawable treasury",
    value: "NGN 8.2M",
  },
  {
    icon: ShieldCheck,
    label: "Locked profit pool",
    value: "NGN 2.3M",
  },
  {
    icon: CalendarClock,
    label: "Scheduled maturity",
    value: "31 Dec 2026",
  },
];

export default function PayoutsPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Financial state transitions
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">
              Payouts and exits
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline">
              <DoorOpen aria-hidden="true" />
              Request exit
            </Button>
            <Button>
              <RefreshCcw aria-hidden="true" />
              Reinvest profit
            </Button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {stateCards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                key={card.label}
                className="rounded-lg border bg-card p-5 shadow-xs"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {card.label}
                    </p>
                    <p className="mt-3 text-2xl font-semibold">{card.value}</p>
                  </div>
                  <span className="flex size-10 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                </div>
              </article>
            );
          })}
        </section>

        <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <article className="overflow-hidden rounded-lg border bg-card shadow-xs">
            <div className="border-b p-5">
              <h2 className="text-lg font-semibold">Maturity schedule</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Principal remains exit-eligible while investment profit stays
                locked until maturity or reinvestment.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-muted/60 text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-medium">Member</th>
                    <th className="px-5 py-3 font-medium">Ownership</th>
                    <th className="px-5 py-3 font-medium">Principal</th>
                    <th className="px-5 py-3 font-medium">Locked profit</th>
                    <th className="px-5 py-3 font-medium">Maturity payout</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {payoutRows.map((row) => (
                    <tr key={row.member}>
                      <td className="px-5 py-4 font-medium">{row.member}</td>
                      <td className="px-5 py-4">{row.ownership}</td>
                      <td className="px-5 py-4">{row.principal}</td>
                      <td className="px-5 py-4">{row.lockedProfit}</td>
                      <td className="px-5 py-4 font-semibold">
                        {row.maturity}
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <aside className="flex flex-col gap-5">
            <section className="rounded-lg border bg-card p-5 shadow-xs">
              <p className="flex items-center gap-2 text-sm font-medium text-primary">
                <ArrowRightLeft className="size-4" aria-hidden="true" />
                Reinvestment workflow
              </p>
              <h2 className="mt-3 text-lg font-semibold">
                Route locked profit
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Members can reinvest available locked profit into selected
                investments or treasury reserve without marking it as paid out.
              </p>
              <div className="mt-5 grid gap-3">
                {["Treasury reserve", "Selected investments"].map((target) => (
                  <div
                    key={target}
                    className="flex items-center justify-between rounded-lg bg-background px-3 py-2 text-sm"
                  >
                    <span>{target}</span>
                    <CheckCircle2 className="size-4 text-primary" />
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border bg-card p-5 shadow-xs">
              <p className="text-sm font-medium text-muted-foreground">
                Exit handling
              </p>
              <h2 className="mt-3 text-lg font-semibold">
                Voluntary exit guardrails
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Exit payouts return withdrawable principal, update membership to
                exited, and keep profit locked until the group reaches a
                maturity transition.
              </p>
            </section>
          </aside>
        </section>
      </section>
    </main>
  );
}
