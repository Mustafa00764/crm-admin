"use client"

import { Search } from "lucide-react"
import type {
  DashboardDateRange,
  DashboardFilters as DashboardFiltersType,
} from "../model/dashboard-types"
import type { ChannelType, CurrencyDisplayMode } from "@/entities/crm/types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"

type DashboardFiltersProps = {
  filters: DashboardFiltersType
  onChange: (payload: Partial<DashboardFiltersType>) => void
}

export function DashboardFilters({ filters, onChange }: DashboardFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <SmallSelect
          value={filters.dateRange}
          placeholder="Период"
          className="w-auto"
          onValueChange={(value) =>
            onChange({ dateRange: value as DashboardDateRange })
          }
          items={[
            ["today", "Сегодня"],
            ["yesterday", "Вчера"],
            ["7d", "7 дней"],
            ["30d", "30 дней"],
            ["month", "Месяц"],
            ["quarter", "Квартал"],
            ["year", "Год"],
          ]}
        />

        <SmallSelect
          value={filters.websiteId}
          placeholder="Все сайты"
          className="w-auto"
          onValueChange={(value) => onChange({ websiteId: value })}
          items={[
            ["all", "Все сайты"],
            ["site_001", "sandwichpanelsvspb.ru"],
            ["site_002", "profnastilvspb.ru"],
            ["site_003", "pkmm.ru"],
          ]}
        />

        <SmallSelect
          value={filters.botId}
          placeholder="Все боты"
          className="w-auto"
          onValueChange={(value) => onChange({ botId: value })}
          items={[
            ["all", "Все боты"],
            ["bot_001", "Telegram Bot"],
            ["bot_002", "WhatsApp Bot"],
            ["bot_003", "Site Widget"],
          ]}
        />

        <SmallSelect
          value={filters.channel}
          placeholder="Все каналы"
          className="w-auto"
          onValueChange={(value) =>
            onChange({ channel: value as ChannelType | "all" })
          }
          items={[
            ["all", "Все каналы"],
            ["website_chat", "Website chat"],
            ["telegram", "Telegram"],
            ["whatsapp", "WhatsApp"],
            ["website_form", "Website form"],
            ["phone", "Phone"],
          ]}
        />

        <SmallSelect
          value={filters.managerId}
          placeholder="Все менеджеры"
          className="w-auto"
          onValueChange={(value) => onChange({ managerId: value })}
          items={[
            ["all", "Все менеджеры"],
            ["u_001", "Максим Орлов"],
            ["u_002", "Анна Смирнова"],
          ]}
        />

        <SmallSelect
          value={filters.productCategoryId}
          placeholder="Все категории"
          className="w-auto"
          onValueChange={(value) => onChange({ productCategoryId: value })}
          items={[
            ["all", "Все категории"],
            ["sandwich_panels", "Сэндвич-панели"],
            ["profnastil", "Профнастил"],
            ["metal_tile", "Металлочерепица"],
            ["sip", "SIP-панели"],
          ]}
        />

        <SmallSelect
          value={filters.paymentStatus}
          placeholder="Все оплаты"
          className="w-auto"
          onValueChange={(value) => onChange({ paymentStatus: value })}
          items={[
            ["all", "Все оплаты"],
            ["not_paid", "Не оплачено"],
            ["partially_paid", "Частично"],
            ["paid", "Оплачено"],
            ["refunded", "Возврат"],
          ]}
        />

        <SmallSelect
          value={filters.currencyDisplay}
          placeholder="RUB / UZS"
          className="w-auto"
          onValueChange={(value) =>
            onChange({ currencyDisplay: value as CurrencyDisplayMode })
          }
          items={[
            ["dual", "RUB / UZS"],
            ["rub_only", "RUB"],
            ["uzs_only", "UZS"],
          ]}
        />
      </div>

      <div className="relative w-full max-w-90">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--cf-icon)]" />
        <input
          className="cf-control w-full pl-9 pr-3 outline-none placeholder:text-[var(--cf-text-muted)]"
          placeholder="Search"
        />
      </div>
    </div>
  )
}

function SmallSelect({
  value,
  placeholder,
  items,
  onValueChange,
  className,
}: {
  value: string
  placeholder: string
  items: Array<[string, string]>
  onValueChange: (value: string) => void
  className: string
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={`cf-control ${className} px-3 shadow-none cursor-pointer`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent className="cf-panel cursor-pointer">
        {items.map(([itemValue, label]) => (
          <SelectItem key={itemValue} value={itemValue} className="cursor-pointer">
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}