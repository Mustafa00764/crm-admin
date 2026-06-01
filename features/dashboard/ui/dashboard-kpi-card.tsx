import type { ReactNode } from "react"
import { cn } from "@/shared/lib/cn"

type KpiTone = "success" | "warning" | "error" | "info" | "neutral"

type DashboardKpiCardProps = {
  title: string
  value: ReactNode
  description: string
  icon: ReactNode
  tone: KpiTone
}

const toneClassMap: Record<KpiTone, string> = {
  success:
    "border-[color:var(--cf-green)] text-[color:var(--cf-green)] bg-[rgba(92,207,69,0.08)]",
  warning:
    "border-[color:var(--cf-yellow)] text-[color:var(--cf-yellow)] bg-[rgba(245,187,36,0.08)]",
  error:
    "border-[color:var(--cf-red)] text-[color:var(--cf-red)] bg-[rgba(239,23,72,0.08)]",
  info:
    "border-[color:var(--cf-blue)] text-[color:var(--cf-blue)] bg-[rgba(8,183,239,0.08)]",
  neutral:
    "border-[var(--cf-border)] text-[var(--cf-icon)] bg-[var(--cf-element)]",
}

export function DashboardKpiCard({
  title,
  value,
  description,
  icon,
  tone,
}: DashboardKpiCardProps) {
  return (
    <button
      type="button"
      className="cf-panel cf-card-hover h-auto rounded-md p-3 text-left"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="truncate text-[11px] font-medium text-[var(--cf-text-muted)]">
          {title}
        </div>

        <div className={cn("rounded-md border p-1.5", toneClassMap[tone])}>
          {icon}
        </div>
      </div>

      <div className="mt-4 min-h-[26px] text-[16px] font-semibold leading-tight text-[var(--cf-text)]">
        {value}
      </div>

      <div className="mt-2 truncate text-[10px] text-[var(--cf-text-muted)]">
        {description}
      </div>
    </button>
  )
}