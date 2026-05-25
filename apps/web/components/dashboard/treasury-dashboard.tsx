"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  CircleDollarSign,
  Landmark,
  ShieldCheck,
  Target,
  TrendingUp,
  WalletCards,
} from "lucide-react";

const treasuryTrend = [
  { month: "Jan", contributions: 2.4, treasury: 9.2, roi: 0.7 },
  { month: "Feb", contributions: 2.8, treasury: 10.3, roi: 0.9 },
  { month: "Mar", contributions: 3.1, treasury: 11.8, roi: 1.1 },
  { month: "Apr", contributions: 3.4, treasury: 13.7, roi: 1.5 },
  { month: "May", contributions: 3.9, treasury: 15.9, roi: 1.8 },
  { month: "Jun", contributions: 4.2, treasury: 18.6, roi: 2.3 },
];

const portfolio = [
  { name: "Treasury bills", value: 38, color: "#0f766e" },
  { name: "Agric co-op notes", value: 24, color: "#ca8a04" },
  { name: "Cash reserve", value: 21, color: "#475569" },
  { name: "Private credit", value: 17, color: "#2563eb" },
];

const contributionHealth = [
  { cohort: "Founders", paid: 96, missed: 4 },
  { cohort: "Builders", paid: 88, missed: 12 },
  { cohort: "Stewards", paid: 92, missed: 8 },
  { cohort: "Operators", paid: 84, missed: 16 },
];

const milestones = [
  { label: "Reserve floor", value: 82, amount: "NGN 6.6M" },
  { label: "Q3 deployment", value: 64, amount: "NGN 9.8M" },
  { label: "Member liquidity", value: 47, amount: "NGN 3.1M" },
];

const roiCards = [
  {
    label: "Blended ROI",
    value: "18.4%",
    detail: "+3.2 pts vs plan",
    icon: TrendingUp,
  },
  {
    label: "Locked profit",
    value: "NGN 2.3M",
    detail: "Held for reinvestment",
    icon: ShieldCheck,
  },
  {
    label: "Withdrawable",
    value: "NGN 940K",
    detail: "Eligible this cycle",
    icon: WalletCards,
  },
];

const tooltipStyle = {
  border: "1px solid var(--border)",
  borderRadius: "8px",
  boxShadow: "0 12px 32px rgb(15 23 42 / 0.12)",
};

function toNumber(value: unknown) {
  return typeof value === "number" ? value : Number(value ?? 0);
}

function formatCurrencyTooltip(value: unknown, name: unknown) {
  return [`NGN ${toNumber(value).toFixed(1)}M`, String(name)];
}

function formatPercentTooltip(value: unknown, name: unknown) {
  return [`${toNumber(value)}%`, String(name)];
}

function ChartPlaceholder() {
  return (
    <div
      aria-hidden="true"
      className="flex h-full min-h-0 items-center justify-center rounded-lg bg-muted/45"
    >
      <span className="text-muted-foreground text-sm">Loading chart</span>
    </div>
  );
}

export function TreasuryDashboard() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <main className="bg-background min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-muted-foreground text-sm font-medium">
              Member console
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">
              Treasury dashboard
            </h1>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[520px]">
            {[
              ["Members", "128"],
              ["Collection", "91%"],
              ["Open votes", "3"],
              ["Risk", "Low"],
            ].map(([label, value], index) => (
              <motion.div
                key={label}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border bg-card p-3"
                initial={{ opacity: 0, y: 8 }}
                transition={{ delay: index * 0.04, duration: 0.28 }}
              >
                <p className="text-muted-foreground text-xs">{label}</p>
                <p className="mt-1 text-lg font-semibold">{value}</p>
              </motion.div>
            ))}
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {roiCards.map((card, index) => {
            const Icon = card.icon;

            return (
              <motion.article
                key={card.label}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border bg-card p-5 shadow-xs"
                initial={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.12 + index * 0.05, duration: 0.32 }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-muted-foreground text-sm">
                      {card.label}
                    </p>
                    <p className="mt-3 text-2xl font-semibold md:text-3xl">
                      {card.value}
                    </p>
                  </div>
                  <span className="flex size-10 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                </div>
                <p className="mt-4 flex items-center gap-1 text-sm font-medium text-primary">
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                  {card.detail}
                </p>
              </motion.article>
            );
          })}
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
          <article className="rounded-lg border bg-card p-5 shadow-xs">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Treasury growth</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Contributions, treasury balance, and ROI trend in millions.
                </p>
              </div>
              <div className="mt-3 flex gap-3 text-xs sm:mt-0">
                <span className="flex items-center gap-1">
                  <span className="size-2 rounded-full bg-primary" />
                  Treasury
                </span>
                <span className="flex items-center gap-1">
                  <span className="size-2 rounded-full bg-yellow-600" />
                  ROI
                </span>
              </div>
            </div>
            <div className="mt-6 h-[320px]">
              {isMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={treasuryTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value: number) => `${value}M`}
                      width={38}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={formatCurrencyTooltip}
                    />
                    <Area
                      type="monotone"
                      dataKey="treasury"
                      stroke="#0f766e"
                      fill="#0f766e"
                      fillOpacity={0.14}
                      strokeWidth={3}
                      name="Treasury"
                    />
                    <Area
                      type="monotone"
                      dataKey="roi"
                      stroke="#ca8a04"
                      fill="#ca8a04"
                      fillOpacity={0.16}
                      strokeWidth={3}
                      name="ROI"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <ChartPlaceholder />
              )}
            </div>
          </article>

          <article className="rounded-lg border bg-card p-5 shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Portfolio breakdown</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Allocation by treasury strategy.
                </p>
              </div>
              <Landmark className="size-5 text-primary" aria-hidden="true" />
            </div>
            <div className="mt-5 h-[210px]">
              {isMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={portfolio}
                      dataKey="value"
                      innerRadius={58}
                      outerRadius={88}
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {portfolio.map((slice) => (
                        <Cell key={slice.name} fill={slice.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value) => [
                        `${toNumber(value)}%`,
                        "Allocation",
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <ChartPlaceholder />
              )}
            </div>
            <div className="mt-4 grid gap-3">
              {portfolio.map((item) => (
                <div key={item.name}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-2">
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.name}
                    </span>
                    <span className="font-medium">{item.value}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${item.value}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="rounded-lg border bg-card p-5 shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Contribution health</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Paid versus missed contribution windows by member cohort.
                </p>
              </div>
              <CircleDollarSign
                className="size-5 text-primary"
                aria-hidden="true"
              />
            </div>
            <div className="mt-6 h-[270px]">
              {isMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={contributionHealth}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="cohort"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value: number) => `${value}%`}
                      width={38}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={formatPercentTooltip}
                    />
                    <Bar
                      dataKey="paid"
                      fill="#0f766e"
                      radius={[6, 6, 0, 0]}
                      name="Paid"
                    />
                    <Bar
                      dataKey="missed"
                      fill="#cbd5e1"
                      radius={[6, 6, 0, 0]}
                      name="Missed"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ChartPlaceholder />
              )}
            </div>
          </article>

          <article className="rounded-lg border bg-card p-5 shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Milestone rings</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Funding progress for active communal wealth targets.
                </p>
              </div>
              <Target className="size-5 text-primary" aria-hidden="true" />
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {milestones.map((milestone) => (
                <div
                  key={milestone.label}
                  className="flex flex-col items-center rounded-lg border bg-background p-4 text-center"
                >
                  <div
                    className="grid size-28 place-items-center rounded-full"
                    style={{
                      background: `conic-gradient(#0f766e ${milestone.value}%, #e2e8f0 0)`,
                    }}
                  >
                    <div className="grid size-20 place-items-center rounded-full bg-card">
                      <span className="text-xl font-semibold">
                        {milestone.value}%
                      </span>
                    </div>
                  </div>
                  <p className="mt-4 text-sm font-semibold">
                    {milestone.label}
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {milestone.amount}
                  </p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}
