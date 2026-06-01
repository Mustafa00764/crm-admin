"use client"

import { Search } from "lucide-react"
import { useCRMStore } from "@/entities/crm/model/crm-store"
import type {
  OrderDeliveryStatus,
  OrderFilters,
  OrderPaymentStatus,
  OrderProductionStatus,
  OrderStatus,
} from "../model/orders-types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"

export function OrdersFilters() {
  const { ordersFilters, updateOrdersFilters } = useCRMStore()

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <SmallSelect
          value={ordersFilters.status}
          className="w-[165px]"
          onValueChange={(value) =>
            updateOrdersFilters({ status: value as OrderStatus | "all" })
          }
          items={[
            ["all", "All statuses"],
            ["draft", "Draft"],
            ["confirmed", "Confirmed"],
            ["invoice_sent", "Invoice sent"],
            ["waiting_payment", "Waiting payment"],
            ["partially_paid", "Partially paid"],
            ["paid", "Paid"],
            ["production_planned", "Production planned"],
            ["in_production", "In production"],
            ["production_completed", "Production done"],
            ["ready_for_delivery", "Ready delivery"],
            ["delivery_scheduled", "Delivery scheduled"],
            ["in_delivery", "In delivery"],
            ["delivered", "Delivered"],
            ["completed", "Completed"],
            ["production_delayed", "Production delayed"],
            ["delivery_delayed", "Delivery delayed"],
            ["return_requested", "Return requested"],
            ["partially_returned", "Partial return"],
            ["returned", "Returned"],
            ["refunded", "Refunded"],
            ["cancelled", "Cancelled"],
          ]}
        />

        <SmallSelect
          value={ordersFilters.paymentStatus}
          className="w-[150px]"
          onValueChange={(value) =>
            updateOrdersFilters({
              paymentStatus: value as OrderPaymentStatus | "all",
            })
          }
          items={[
            ["all", "All payments"],
            ["not_paid", "Not paid"],
            ["partially_paid", "Partial"],
            ["paid", "Paid"],
            ["overpaid", "Overpaid"],
            ["partially_refunded", "Partial refund"],
            ["refunded", "Refunded"],
          ]}
        />

        <SmallSelect
          value={ordersFilters.productionStatus}
          className="w-[160px]"
          onValueChange={(value) =>
            updateOrdersFilters({
              productionStatus: value as OrderProductionStatus | "all",
            })
          }
          items={[
            ["all", "Production"],
            ["not_required", "Not required"],
            ["not_started", "Not started"],
            ["planned", "Planned"],
            ["in_progress", "In progress"],
            ["delayed", "Delayed"],
            ["completed", "Completed"],
          ]}
        />

        <SmallSelect
          value={ordersFilters.deliveryStatus}
          className="w-[150px]"
          onValueChange={(value) =>
            updateOrdersFilters({
              deliveryStatus: value as OrderDeliveryStatus | "all",
            })
          }
          items={[
            ["all", "Delivery"],
            ["not_required", "Not required"],
            ["not_scheduled", "Not scheduled"],
            ["scheduled", "Scheduled"],
            ["in_transit", "In transit"],
            ["delayed", "Delayed"],
            ["delivered", "Delivered"],
            ["failed", "Failed"],
            ["returned", "Returned"],
          ]}
        />

        <SmallSelect
          value={ordersFilters.managerId}
          className="w-[150px]"
          onValueChange={(value) => updateOrdersFilters({ managerId: value })}
          items={[
            ["all", "All managers"],
            ["u_001", "Максим Орлов"],
            ["u_002", "Анна Смирнова"],
            ["u_003", "Игорь Ким"],
          ]}
        />

        <SmallSelect
          value={ordersFilters.channel}
          className="w-[140px]"
          onValueChange={(value) => updateOrdersFilters({ channel: value })}
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
          value={ordersFilters.hasDebt}
          className="w-[120px]"
          onValueChange={(value) =>
            updateOrdersFilters({
              hasDebt: value as OrderFilters["hasDebt"],
            })
          }
          items={[
            ["all", "Debt"],
            ["yes", "Has debt"],
            ["no", "No debt"],
          ]}
        />

        <SmallSelect
          value={ordersFilters.hasReturn}
          className="w-[125px]"
          onValueChange={(value) =>
            updateOrdersFilters({
              hasReturn: value as OrderFilters["hasReturn"],
            })
          }
          items={[
            ["all", "Returns"],
            ["yes", "Has return"],
            ["no", "No return"],
          ]}
        />

        <SmallSelect
          value={ordersFilters.hasDelay}
          className="w-[120px]"
          onValueChange={(value) =>
            updateOrdersFilters({
              hasDelay: value as OrderFilters["hasDelay"],
            })
          }
          items={[
            ["all", "Delays"],
            ["yes", "Has delay"],
            ["no", "No delay"],
          ]}
        />

        <SmallSelect
          value={ordersFilters.hasLoss}
          className="w-[115px]"
          onValueChange={(value) =>
            updateOrdersFilters({
              hasLoss: value as OrderFilters["hasLoss"],
            })
          }
          items={[
            ["all", "Loss"],
            ["yes", "Has loss"],
            ["no", "No loss"],
          ]}
        />
      </div>

      <div className="relative w-full max-w-[430px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--cf-icon)]" />

        <input
          className="cf-control w-full pl-9 pr-3 outline-none placeholder:text-[var(--cf-text-muted)]"
          placeholder="Search order, client, phone, company..."
          value={ordersFilters.search}
          onChange={(event) =>
            updateOrdersFilters({ search: event.target.value })
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