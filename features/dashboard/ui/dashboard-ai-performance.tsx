import type { CurrencyDisplayMode } from "@/entities/crm/types"
import type { DashboardAiAgentItem } from "../model/dashboard-types"
import { CrmMoneyPair } from "@/shared/ui/crm-money-pair"
import { formatNumber } from "@/shared/lib/format-number"
import { cn } from "@/shared/lib/cn"
import { Badge } from "@/shared/ui/badge"
import { Brain } from "lucide-react"

type DashboardAiPerformanceProps = {
  data: DashboardAiAgentItem[]
  displayMode: CurrencyDisplayMode
}

export function DashboardAiPerformance({
  data,
  displayMode,
}: DashboardAiPerformanceProps) {
  const totals = data.reduce(
    (acc, agent) => {
      acc.replies += agent.replies
      acc.fallback += agent.fallbackToManager
      acc.confidence += agent.averageConfidence
      return acc
    },
    { replies: 0, fallback: 0, confidence: 0 }
  )

  const averageConfidence =
    data.length > 0 ? Math.round(totals.confidence / data.length) : 0

  return (
    <section className="cf-panel p-3">
      <div className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-[var(--cf-text)]">
        <Brain className="h-4 w-4 text-[var(--cf-icon)]" />
        AI performance
      </div>

      <div className="mb-3 grid gap-2 sm:grid-cols-3">
        <SummaryBox label="AI replies" value={formatNumber(totals.replies)} />
        <SummaryBox label="Fallback" value={formatNumber(totals.fallback)} tone="warning" />
        <SummaryBox label="Confidence" value={`${averageConfidence}%`} tone="success" />
      </div>

      <div className="space-y-2">
        {data.map((agent) => (
          <div key={agent.id} className="cf-panel-soft p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={cn("h-2 w-2 rounded-full", getStatusDotClass(agent.status))} />
                  <span className="text-[12px] font-medium text-[var(--cf-text)]">
                    {agent.name}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-[var(--cf-text-muted)]">
                  <Badge className="bg-[var(--cf-button)] text-[var(--cf-text)]">
                    {agent.mode}
                  </Badge>
                  <span>{formatNumber(agent.replies)} replies</span>
                  <span>{formatNumber(agent.fallbackToManager)} fallback</span>
                </div>
              </div>

              <div className="text-right text-[12px] font-medium text-[var(--cf-text)]">
                <CrmMoneyPair value={agent.revenueAfterAi} displayMode={displayMode} />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-[var(--cf-text-muted)]">
              <span>confidence</span>
              <span>{agent.averageConfidence}%</span>
            </div>

            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--cf-element)]">
              <div
                className="h-full rounded-full bg-[var(--cf-green)]"
                style={{ width: `${Math.min(agent.averageConfidence, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function SummaryBox({
  label,
  value,
  tone = "default",
}: {
  label: string
  value: string
  tone?: "default" | "success" | "warning"
}) {
  return (
    <div className="cf-panel-soft p-3">
      <div className="text-[11px] text-[var(--cf-text-muted)]">{label}</div>
      <div
        className={cn(
          "mt-2 text-[16px] font-semibold",
          tone === "success" && "text-[var(--cf-green)]",
          tone === "warning" && "text-[var(--cf-yellow)]",
          tone === "default" && "text-[var(--cf-text)]"
        )}
      >
        {value}
      </div>
    </div>
  )
}

function getStatusDotClass(status: "active" | "warning" | "error") {
  if (status === "active") return "bg-[var(--cf-green)]"
  if (status === "warning") return "bg-[var(--cf-yellow)]"
  return "bg-[var(--cf-red)]"
}