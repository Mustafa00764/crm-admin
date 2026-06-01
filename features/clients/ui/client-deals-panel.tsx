"use client"

import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  MessageSquare,
  Package,
  TrendingUp,
  XCircle,
} from "lucide-react"
import type {
  ClientDealStatus,
  ClientDealSummary,
} from "../model/clients-types"
import { CrmMoneyPair } from "@/shared/ui/crm-money-pair"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"

type ClientDealsPanelProps = {
  deals: ClientDealSummary[]
}

export function ClientDealsPanel({ deals }: ClientDealsPanelProps) {
  const activeDeals = deals.filter(
    (deal) =>
      deal.status !== "won" &&
      deal.status !== "lost" &&
      deal.status !== "cancelled"
  )

  const wonDeals = deals.filter((deal) => deal.status === "won")
  const lostDeals = deals.filter((deal) => deal.status === "lost")
  const latestDeal = getLatestDeal(deals)

  return (
    <section className="cf-panel-soft p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[12px] font-semibold text-(--cf-text)">
          <TrendingUp className="h-4 w-4 text-(--cf-icon)" />
          Deals
        </div>

        <Button
          type="button"
          variant="ghost"
          className="h-7 rounded-md bg-(--cf-button) px-2 text-[11px] text-(--cf-text) hover:bg-(--cf-element-hover)"
        >
          Create deal
        </Button>
      </div>

      {deals.length === 0 ? (
        <div className="text-[11px] text-(--cf-text-muted)">
          Сделок по клиенту пока нет.
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-2">
            <DealCounter label="All" value={deals.length} />
            <DealCounter label="Active" value={activeDeals.length} />
            <DealCounter label="Won" value={wonDeals.length} />
            <DealCounter label="Lost" value={lostDeals.length} />
          </div>

          {latestDeal ? (
            <div className="rounded-md border border-(--cf-border) bg-(--cf-element) p-2">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-[12px] font-semibold text-(--cf-text)">
                    Latest: {latestDeal.title}
                  </div>

                  <div className="mt-1 text-[10px] text-(--cf-text-muted)">
                    {latestDeal.dealNumber} · {latestDeal.createdAt}
                  </div>
                </div>

                <DealStatusBadge status={latestDeal.status} />
              </div>

              <div className="text-[12px] font-semibold text-(--cf-text)">
                <CrmMoneyPair value={latestDeal.amount} displayMode="dual" />
              </div>

              {latestDeal.nextStep ? (
                <div className="mt-2 rounded-md border border-(--cf-border) bg-(--cf-bg) p-2 text-[11px] leading-5 text-(--cf-text-muted)">
                  Next: {latestDeal.nextStep}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="space-y-2">
            {deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function DealCard({ deal }: { deal: ClientDealSummary }) {
  return (
    <div className="rounded-md border border-(--cf-border) bg-(--cf-element) p-2">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-[12px] font-semibold text-(--cf-text)">
            {deal.title}
          </div>

          <div className="mt-1 flex flex-wrap gap-1.5">
            <Badge className="bg-(--cf-button) text-(--cf-text)">
              {deal.dealNumber}
            </Badge>

            <DealStatusBadge status={deal.status} />

            <Badge className="bg-(--cf-button) text-(--cf-text)">
              {deal.priority}
            </Badge>

            <Badge className="bg-(--cf-button) text-(--cf-text)">
              {deal.probability}%
            </Badge>
          </div>
        </div>

        <button
          type="button"
          className="text-(--cf-icon) hover:text-(--cf-text)"
        >
          <ExternalLink className="h-4 w-4" />
        </button>
      </div>

      {deal.description ? (
        <div className="mb-2 text-[11px] leading-5 text-(--cf-text-muted)">
          {deal.description}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        <InfoBox
          label="Amount"
          value={<CrmMoneyPair value={deal.amount} displayMode="dual" />}
        />

        <InfoBox label="Manager" value={deal.managerName ?? "—"} />

        <InfoBox
          label="Volume"
          value={
            deal.requiredVolume
              ? `${deal.requiredVolume} ${deal.requiredUnit ?? ""}`
              : "—"
          }
        />

        <InfoBox label="Source" value={`${deal.source} / ${deal.channel}`} />
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <ActionLink
          icon={<MessageSquare className="h-3.5 w-3.5" />}
          label={
            deal.relatedConversationId
              ? "Open conversation"
              : "No conversation"
          }
          disabled={!deal.relatedConversationId}
        />

        <ActionLink
          icon={<Package className="h-3.5 w-3.5" />}
          label={deal.relatedOrderId ? "Open order" : "No order"}
          disabled={!deal.relatedOrderId}
        />
      </div>

      {deal.lostReason ? (
        <div className="mt-2 rounded-md border border-[rgba(239,23,72,0.25)] bg-[rgba(239,23,72,0.08)] p-2 text-[11px] leading-5 text-(--cf-red)">
          Lost reason: {deal.lostReason}
        </div>
      ) : null}

      <div className="mt-2 flex justify-between gap-2 text-[10px] text-(--cf-text-muted)">
        <span>Created: {deal.createdAt}</span>
        <span>Updated: {deal.updatedAt}</span>
      </div>
    </div>
  )
}

function DealCounter({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-(--cf-border) bg-(--cf-element) p-2 text-center">
      <div className="text-[14px] font-semibold text-(--cf-text)">
        {value}
      </div>

      <div className="mt-0.5 text-[9px] text-(--cf-text-muted)">
        {label}
      </div>
    </div>
  )
}

function DealStatusBadge({ status }: { status: ClientDealStatus }) {
  const config = getDealStatusConfig(status)

  return (
    <Badge className={config.className}>
      <span className="mr-1">{config.icon}</span>
      {status}
    </Badge>
  )
}

function getDealStatusConfig(status: ClientDealStatus) {
  if (status === "won") {
    return {
      icon: <CheckCircle2 className="h-3 w-3" />,
      className: "bg-[var(--cf-green)] text-black",
    }
  }

  if (status === "lost" || status === "cancelled") {
    return {
      icon: <XCircle className="h-3 w-3" />,
      className: "bg-[var(--cf-red)] text-white",
    }
  }

  if (status === "waiting_decision" || status === "negotiation") {
    return {
      icon: <Clock3 className="h-3 w-3" />,
      className: "bg-[var(--cf-yellow)] text-black",
    }
  }

  if (status === "calculation" || status === "proposal_sent") {
    return {
      icon: <FileText className="h-3 w-3" />,
      className: "bg-[var(--cf-blue)] text-black",
    }
  }

  return {
    icon: <AlertTriangle className="h-3 w-3" />,
    className: "bg-[var(--cf-button)] text-[var(--cf-text)]",
  }
}

function InfoBox({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="min-w-0 rounded-md border border-(--cf-border) bg-(--cf-element) p-2">
      <div className="text-[10px] text-(--cf-text-muted)">{label}</div>

      <div className="mt-1 truncate text-[11px] font-medium text-(--cf-text)">
        {value}
      </div>
    </div>
  )
}

function ActionLink({
  icon,
  label,
  disabled,
}: {
  icon: React.ReactNode
  label: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      className="flex h-8 items-center justify-center gap-1.5 rounded-md bg-(--cf-button) px-2 text-[11px] text-(--cf-text) hover:bg-(--cf-element-hover) disabled:cursor-not-allowed disabled:opacity-40"
    >
      {icon}
      {label}
    </button>
  )
}

function getLatestDeal(deals: ClientDealSummary[]) {
  return [...deals].sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )[0]
}