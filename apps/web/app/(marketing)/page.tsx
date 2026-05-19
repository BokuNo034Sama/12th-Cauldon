import {
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Users,
  WalletCards,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const trustSignals = [
  { label: "Monthly contribution completion", value: ">80% target" },
  { label: "Group retention", value: ">70% at 6 months" },
  { label: "Reinvestment rate", value: ">50% target" },
];

export default function MarketingPage() {
  return (
    <main className="bg-background min-h-screen">
      <section className="mx-auto grid min-h-screen w-full max-w-6xl gap-10 px-6 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="text-muted-foreground mb-4 inline-flex rounded-md border px-3 py-1 text-sm">
            Collaborative savings and investment
          </p>
          <h1 className="text-foreground max-w-3xl text-5xl font-semibold tracking-normal">
            12th Cauldron
          </h1>
          <p className="text-muted-foreground mt-5 max-w-2xl text-lg leading-8">
            Build wealth together through trusted circles, transparent treasury
            tracking, and milestone-based ownership goals.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button>
              Start a circle <ArrowRight />
            </Button>
            <Button variant="secondary">View dashboard</Button>
          </div>
        </div>

        <div className="grid gap-4">
          {trustSignals.map((item) => (
            <div
              key={item.label}
              className="bg-card rounded-lg border p-5 shadow-xs"
            >
              <p className="text-muted-foreground text-sm">{item.label}</p>
              <p className="mt-2 text-xl font-semibold">{item.value}</p>
            </div>
          ))}
          <div className="grid grid-cols-4 gap-3 pt-2">
            {[Users, WalletCards, ShieldCheck, Smartphone].map(
              (Icon, index) => (
                <div key={index} className="bg-card rounded-md border p-4">
                  <Icon className="text-primary mb-4 size-5" />
                  <div className="bg-muted h-2 rounded" />
                </div>
              ),
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
