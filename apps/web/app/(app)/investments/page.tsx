import { Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";

const proposals = [
  {
    approvals: 31,
    category: "Treasury bill ladder",
    summary:
      "Short-duration allocation with predictable yield and low liquidity pressure.",
    title: "Conservative yield bucket",
  },
  {
    approvals: 26,
    category: "Agric cooperative note",
    summary:
      "Moderate-risk community investment with monthly operating updates.",
    title: "Farm input financing",
  },
  {
    approvals: 18,
    category: "Money market fund",
    summary:
      "Liquid reserve placement for idle treasury balance and emergency exits.",
    title: "Liquidity reserve",
  },
];

export default function InvestmentsPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-8">
      <section className="mx-auto w-full max-w-6xl">
        <div className="border-b pb-6">
          <p className="text-sm font-medium text-muted-foreground">
            Voting room
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">
            Investment proposals
          </h1>
        </div>

        <div className="grid gap-4 py-8 lg:grid-cols-3">
          {proposals.map((proposal) => (
            <article
              key={proposal.title}
              className="rounded-lg border bg-card p-5 shadow-xs"
            >
              <p className="text-sm text-muted-foreground">
                {proposal.category}
              </p>
              <h2 className="mt-3 text-xl font-semibold">{proposal.title}</h2>
              <p className="mt-3 min-h-20 text-sm leading-6 text-muted-foreground">
                {proposal.summary}
              </p>
              <div className="mt-5 flex items-center justify-between border-t pt-4">
                <span className="text-sm font-medium">
                  {proposal.approvals} approvals
                </span>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    aria-label="Reject proposal"
                  >
                    <X />
                  </Button>
                  <Button size="icon" aria-label="Approve proposal">
                    <Check />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
