"use client"

import { Search } from "lucide-react"
import type { ChannelType } from "@/entities/crm/types"
import type { DealPriority, DealStage } from "../model/deals-types"
import { useCRMStore } from "@/entities/crm/model/crm-store"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"

export function DealsFilters() {
  const { dealsFilters, updateDealsFilters } = useCRMStore()

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <SmallSelect
          value={dealsFilters.stage}
          className="w-[150px]"
          onValueChange={(value) =>
            updateDealsFilters({ stage: value as DealStage | "all" })
          }
          items={[
            ["all", "All stages"],
            ["new", "New"],
            ["qualification", "Qualification"],
            ["calculation", "Calculation"],
            ["proposal_sent", "Proposal sent"],
            ["negotiation", "Negotiation"],
            ["waiting_decision", "Waiting"],
            ["won", "Won"],
            ["lost", "Lost"],
            ["cancelled", "Cancelled"],
          ]}
        />

        <SmallSelect
          value={dealsFilters.managerId}
          className="w-[150px]"
          onValueChange={(value) => updateDealsFilters({ managerId: value })}
          items={[
            ["all", "All managers"],
            ["u_001", "Максим Орлов"],
            ["u_002", "Анна Смирнова"],
            ["u_003", "Игорь Ким"],
          ]}
        />

        <SmallSelect
          value={dealsFilters.source}
          className="w-[140px]"
          onValueChange={(value) => updateDealsFilters({ source: value })}
          items={[
            ["all", "All sources"],
            ["telegram_bot", "Telegram bot"],
            ["whatsapp_bot", "WhatsApp bot"],
            ["site_widget", "Site widget"],
            ["website_chat", "Website chat"],
            ["phone", "Phone"],
          ]}
        />

        <SmallSelect
          value={dealsFilters.channel}
          className="w-[140px]"
          onValueChange={(value) =>
            updateDealsFilters({ channel: value as ChannelType | "all" })
          }
          items={[
            ["all", "All channels"],
            ["telegram", "Telegram"],
            ["whatsapp", "WhatsApp"],
            ["website_chat", "Website chat"],
            ["phone", "Phone"],
            ["manual", "Manual"],
          ]}
        />

        <SmallSelect
          value={dealsFilters.priority}
          className="w-[130px]"
          onValueChange={(value) =>
            updateDealsFilters({ priority: value as DealPriority | "all" })
          }
          items={[
            ["all", "Priority"],
            ["low", "Low"],
            ["normal", "Normal"],
            ["high", "High"],
            ["urgent", "Urgent"],
          ]}
        />

        <SmallSelect
          value={dealsFilters.hasOrder}
          className="w-[130px]"
          onValueChange={(value) =>
            updateDealsFilters({ hasOrder: value as "all" | "yes" | "no" })
          }
          items={[
            ["all", "Orders"],
            ["yes", "Has order"],
            ["no", "No order"],
          ]}
        />

        <input
          className="cf-control w-[120px] px-3 outline-none placeholder:text-[var(--cf-text-muted)]"
          placeholder="Amount from"
          value={dealsFilters.amountFrom}
          onChange={(event) =>
            updateDealsFilters({ amountFrom: event.target.value })
          }
        />

        <input
          className="cf-control w-[120px] px-3 outline-none placeholder:text-[var(--cf-text-muted)]"
          placeholder="Amount to"
          value={dealsFilters.amountTo}
          onChange={(event) =>
            updateDealsFilters({ amountTo: event.target.value })
          }
        />
      </div>

      <div className="relative w-full max-w-[390px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--cf-icon)]" />
        <input
          className="cf-control w-full pl-9 pr-3 outline-none placeholder:text-[var(--cf-text-muted)]"
          placeholder="Search deal, client, phone, company..."
          value={dealsFilters.search}
          onChange={(event) =>
            updateDealsFilters({ search: event.target.value })
          }
        />
      </div>
    </section>
  )
}

function SmallSelect({
  value,
  items,
  onValueChange,
  className,
}: {
  value: string
  items: Array<[string, string]>
  onValueChange: (value: string) => void
  className: string
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={`cf-control ${className} px-3 shadow-none`}>
        <SelectValue />
      </SelectTrigger>

      <SelectContent className="cf-panel">
        {items.map(([itemValue, label]) => (
          <SelectItem key={itemValue} value={itemValue}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}