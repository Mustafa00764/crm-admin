"use client"

import {
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  MoreVertical,
  PackagePlus,
  Trash2,
} from "lucide-react"
import type { CRMDeal } from "../model/deals-types"
import { useCRMStore } from "@/entities/crm/model/crm-store"
import { Button } from "@/shared/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"

export function DealRowActionsMenu({ deal }: { deal: CRMDeal }) {
  const { createOrderFromDeal, deleteDeal, updateDealStage } = useCRMStore()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-(--cf-table-text) hover:text-(--cf-table-text) dark:hover:bg-(--cf-table-text)/15 hover:bg-(--cf-table-text)/15 aria-expanded:text-(--cf-table-text) aria-expanded:bg-(--cf-table-text)/15"
          onClick={(event) => event.stopPropagation()}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="cf-panel w-56"
        onClick={(event) => event.stopPropagation()}
      >
        <DropdownMenuItem>
          <ExternalLink className="mr-2 h-4 w-4 text-[var(--cf-icon)]" />
          Открыть сделку
        </DropdownMenuItem>

        <DropdownMenuItem disabled={!deal.relatedConversationId}>
          <MessageSquare className="mr-2 h-4 w-4 text-[var(--cf-icon)]" />
          Открыть чат
        </DropdownMenuItem>

        <DropdownMenuItem
          disabled={Boolean(deal.relatedOrderId)}
          onClick={() => void createOrderFromDeal(deal.id)}
        >
          <PackagePlus className="mr-2 h-4 w-4 text-[var(--cf-icon)]" />
          Создать заказ
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-[var(--cf-border)]" />

        <DropdownMenuItem onClick={() => void updateDealStage(deal.id, "won")}>
          <CheckCircle2 className="mr-2 h-4 w-4 text-[var(--cf-green)]" />
          Mark as won
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-[var(--cf-border)]" />

        <DropdownMenuItem
          className="text-[var(--cf-red)]"
          onClick={() => void deleteDeal(deal.id)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Удалить сделку
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}