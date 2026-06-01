'use client'

import {
  CheckCircle2,
  ExternalLink,
  MoreVertical,
  RefreshCcw,
  Trash2,
  XCircle
} from 'lucide-react'
import { useCRMStore } from '@/entities/crm/model/crm-store'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/shared/ui/dropdown-menu'
import type { PaymentRow } from '../model/payments-types'

export function PaymentRowActionsMenu({
  row,
  onOpen
}: {
  row: PaymentRow
  onOpen: () => void
}) {
  const { updateOrderPaymentStatus, deleteOrderPayment } = useCRMStore()

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
        className="cf-panel w-56"
        onClick={event => event.stopPropagation()}
      >
        <DropdownMenuItem onClick={onOpen}>
          <ExternalLink className="mr-2 h-4 w-4 text-(--cf-icon)" />
          Открыть оплату
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-(--cf-border)" />

        <DropdownMenuItem
          onClick={() =>
            void updateOrderPaymentStatus(row.orderId, row.payment.id, 'confirmed')
          }
        >
          <CheckCircle2 className="mr-2 h-4 w-4 text-(--cf-green)" />
          Mark as confirmed
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() =>
            void updateOrderPaymentStatus(row.orderId, row.payment.id, 'refunded')
          }
        >
          <RefreshCcw className="mr-2 h-4 w-4 text-(--cf-pink)" />
          Mark as refunded
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() =>
            void updateOrderPaymentStatus(row.orderId, row.payment.id, 'cancelled')
          }
        >
          <XCircle className="mr-2 h-4 w-4 text-(--cf-red)" />
          Mark as cancelled
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-(--cf-border)" />

        <DropdownMenuItem
          className="text-(--cf-red)"
          onClick={() => {
            const confirmed = window.confirm(
              'Удалить оплату? paidAmount, remainingAmount и paymentStatus заказа будут пересчитаны.'
            )

            if (!confirmed) return

            void deleteOrderPayment(row.orderId, row.payment.id)
          }}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Удалить оплату
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}