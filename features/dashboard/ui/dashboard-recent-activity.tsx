import type { DashboardRecentActivity } from "../model/dashboard-types"
import { Activity } from "lucide-react"

type DashboardRecentActivityProps = {
  data: DashboardRecentActivity[]
}

export function DashboardRecentActivity({
  data,
}: DashboardRecentActivityProps) {
  return (
    <section className="cf-panel flex-1 p-3">
      <div className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-[var(--cf-text)]">
        <Activity className="h-4 w-4 text-[var(--cf-icon)]" />
        Последние действия
      </div>

      <div className="space-y-2">
        {data.length === 0 ? (
          <div className="cf-panel-soft p-6 text-center text-[12px] text-[var(--cf-text-muted)]">
            Действий пока нет
          </div>
        ) : null}

        {data.map((item) => (
          <div key={item.id} className="cf-panel-soft flex gap-3 p-3">
            <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--cf-blue)]" />

            <div className="min-w-0 flex-1">
              <div className="text-[12px] text-[var(--cf-text)]">
                <span className="font-medium">{item.actorName}</span>{" "}
                <span className="text-[var(--cf-text-muted)]">{item.action}</span>
              </div>

              <div className="mt-1 text-[11px] leading-5 text-[var(--cf-text-muted)]">
                {item.description}
              </div>
            </div>

            <div className="shrink-0 text-[10px] text-[var(--cf-text-muted)]">
              {item.createdAt}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}