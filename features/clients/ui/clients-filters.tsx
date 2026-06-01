"use client"

import { Search } from "lucide-react"
import type { ChannelType } from "@/entities/crm/types"
import type { ClientStatus } from "../model/clients-types"
import { useCRMStore } from "@/entities/crm/model/crm-store"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"

export function ClientsFilters() {
  const { clientsFilters, updateClientsFilters } = useCRMStore()

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <SmallSelect
          value={clientsFilters.status}
          className="w-[132px]"
          onValueChange={(value) =>
            updateClientsFilters({ status: value as ClientStatus | "all" })
          }
          items={[
            ["all", "All statuses"],
            ["new", "New"],
            ["ai_active", "AI active"],
            ["manager_active", "Manager active"],
            ["qualified", "Qualified"],
            ["calculation", "Calculation"],
            ["deal_created", "Deal created"],
            ["order_created", "Order created"],
            ["waiting_payment", "Waiting payment"],
            ["customer", "Customer"],
            ["repeat_customer", "Repeat"],
            ["lost", "Lost"],
            ["spam", "Spam"],
            ["archived", "Archived"],
          ]}
        />

        <SmallSelect
          value={clientsFilters.managerId}
          className="w-[142px]"
          onValueChange={(value) => updateClientsFilters({ managerId: value })}
          items={[
            ["all", "All managers"],
            ["u_001", "Максим Орлов"],
            ["u_002", "Анна Смирнова"],
          ]}
        />

        <SmallSelect
          value={clientsFilters.channel}
          className="w-[132px]"
          onValueChange={(value) =>
            updateClientsFilters({ channel: value as ChannelType | "all" })
          }
          items={[
            ["all", "All channels"],
            ["telegram", "Telegram"],
            ["whatsapp", "WhatsApp"],
            ["website_chat", "Website chat"],
            ["website_form", "Form"],
            ["phone", "Phone"],
            ["manual", "Manual"],
          ]}
        />

        <SmallSelect
          value={clientsFilters.websiteId}
          className="w-[170px]"
          onValueChange={(value) => updateClientsFilters({ websiteId: value })}
          items={[
            ["all", "All websites"],
            ["site_001", "sandwichpanelsvspb.ru"],
            ["site_002", "profnastilvspb.ru"],
            ["site_003", "pkmm.ru"],
          ]}
        />

        <SmallSelect
          value={clientsFilters.botId}
          className="w-[130px]"
          onValueChange={(value) => updateClientsFilters({ botId: value })}
          items={[
            ["all", "All bots"],
            ["bot_001", "Telegram Bot"],
            ["bot_002", "WhatsApp Bot"],
            ["bot_003", "Site Widget"],
          ]}
        />

        <SmallSelect
          value={clientsFilters.utmSource}
          className="w-[120px]"
          onValueChange={(value) => updateClientsFilters({ utmSource: value })}
          items={[
            ["all", "All UTM"],
            ["yandex", "yandex"],
            ["telegram", "telegram"],
            ["whatsapp", "whatsapp"],
          ]}
        />

        <SmallSelect
          value={clientsFilters.city}
          className="w-[130px]"
          onValueChange={(value) => updateClientsFilters({ city: value })}
          items={[
            ["all", "All cities"],
            ["гатчина", "Гатчина"],
            ["всеволожск", "Всеволожск"],
            ["санкт-петербург", "Санкт-Петербург"],
          ]}
        />

        <SmallSelect
          value={clientsFilters.hasDebt}
          className="w-[112px]"
          onValueChange={(value) =>
            updateClientsFilters({ hasDebt: value as "all" | "yes" | "no" })
          }
          items={[
            ["all", "Debt"],
            ["yes", "Has debt"],
            ["no", "No debt"],
          ]}
        />

        <SmallSelect
          value={clientsFilters.hasReturn}
          className="w-[118px]"
          onValueChange={(value) =>
            updateClientsFilters({ hasReturn: value as "all" | "yes" | "no" })
          }
          items={[
            ["all", "Returns"],
            ["yes", "Has return"],
            ["no", "No return"],
          ]}
        />

        <SmallSelect
          value={clientsFilters.hasActivitySessions}
          className="w-[150px]"
          onValueChange={(value) =>
            updateClientsFilters({
              hasActivitySessions: value as "all" | "yes" | "no",
            })
          }
          items={[
            ["all", "Activity sessions"],
            ["yes", "Has sessions"],
            ["no", "No sessions"],
          ]}
        />
      </div>

      <div className="relative w-full max-w-[360px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--cf-icon)]" />
        <input
          className="cf-control w-full pl-9 pr-3 outline-none placeholder:text-[var(--cf-text-muted)]"
          placeholder="Search client, phone, email, company..."
          value={clientsFilters.search}
          onChange={(event) =>
            updateClientsFilters({ search: event.target.value })
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