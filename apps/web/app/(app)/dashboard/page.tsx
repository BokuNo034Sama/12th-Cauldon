const metrics = [
  { label: "Treasury balance", value: "NGN 12.4M" },
  { label: "Ownership tracked", value: "128 members" },
  { label: "Active proposals", value: "3 votes" },
  { label: "Milestone progress", value: "64%" },
];

export default function DashboardPage() {
  return (
    <main className="bg-background min-h-screen px-6 py-8">
      <section className="mx-auto w-full max-w-6xl">
        <div className="border-b pb-6">
          <p className="text-muted-foreground text-sm font-medium">
            Member console
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">
            Treasury dashboard
          </h1>
        </div>

        <div className="grid gap-4 py-8 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="bg-card rounded-lg border p-5 shadow-xs"
            >
              <p className="text-muted-foreground text-sm">{metric.label}</p>
              <p className="mt-3 text-2xl font-semibold">{metric.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-lg font-semibold">Contribution timeline</h2>
            <div className="mt-6 grid gap-3">
              {["January", "February", "March", "April"].map((month, index) => (
                <div
                  key={month}
                  className="grid grid-cols-[100px_1fr] items-center gap-4"
                >
                  <span className="text-muted-foreground text-sm">{month}</span>
                  <div className="bg-muted h-3 rounded">
                    <div
                      className="bg-primary h-3 rounded"
                      style={{ width: `${55 + index * 10}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-lg font-semibold">Risk posture</h2>
            <p className="text-muted-foreground mt-4 text-sm leading-6">
              Conservative group profile with transparent voting, locked
              investment profits, and auditable treasury movement.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
