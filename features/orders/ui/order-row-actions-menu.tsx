'use client'

import {
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  MoreVertical,
  PackageCheck,
  RotateCcw,
  Trash2,
  Truck,
  XCircle
} from 'lucide-react'
import type { CRMOrder } from '../model/orders-types'
import { useCRMStore } from '@/entities/crm/model/crm-store'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/shared/ui/dropdown-menu'

export function OrderRowActionsMenu({
  order,
  onOpen
}: {
  order: CRMOrder
  onOpen: () => void
}) {
  const { updateOrderStatus, deleteOrder } = useCRMStore()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-(--cf-table-text) hover:bg-(--cf-table-text)/15 hover:text-(--cf-table-text) dark:hover:bg-(--cf-table-text)/15 aria-expanded:text-(--cf-table-text) aria-expanded:bg-(--cf-table-text)/15"
          onClick={event => event.stopPropagation()}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="cf-panel w-56 ring-0"
        onClick={event => event.stopPropagation()}
      >
        <DropdownMenuItem onClick={onOpen}>
          <ExternalLink className="mr-2 h-4 w-4 text-[var(--cf-icon)]" />
          Открыть заказ
        </DropdownMenuItem>

        <DropdownMenuItem disabled={!order.conversationId}>
          <MessageSquare className="mr-2 h-4 w-4 text-[var(--cf-icon)]" />
          Открыть чат
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-[var(--cf-border)]" />

        <DropdownMenuItem
          onClick={() => void updateOrderStatus(order.id, 'delivered')}
        >
          <Truck className="mr-2 h-4 w-4 text-[var(--cf-blue)]" />
          Mark as delivered
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => void updateOrderStatus(order.id, 'completed')}
        >
          <CheckCircle2 className="mr-2 h-4 w-4 text-[var(--cf-green)]" />
          Mark as completed
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => void updateOrderStatus(order.id, 'partially_returned')}
        >
          <RotateCcw className="mr-2 h-4 w-4 text-[var(--cf-yellow)]" />
          Mark as partial return
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => void updateOrderStatus(order.id, 'cancelled')}
        >
          <XCircle className="mr-2 h-4 w-4 text-[var(--cf-red)]" />
          Mark as cancelled
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-[var(--cf-border)]" />

        <DropdownMenuItem
          className="text-[var(--cf-red)]"
          onClick={() => void deleteOrder(order.id)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Удалить заказ
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
