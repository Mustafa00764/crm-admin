'use client'

import {
  Archive,
  Copy,
  ExternalLink,
  MoreVertical,
  NotepadTextDashed,
  Pencil,
  ShieldCheck,
  Trash2
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
import type { CRMProduct } from '../model/products-types'

export function ProductRowActionsMenu({
  product,
  onOpen
}: {
  product: CRMProduct
  onOpen: () => void
}) {
  const { updateProductStatus, duplicateProduct, deleteProduct } = useCRMStore()

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
          <ExternalLink className="mr-2 h-4 w-4 text-[var(--cf-icon)]" />
          Открыть товар
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onOpen}>
          <Pencil className="mr-2 h-4 w-4 text-[var(--cf-icon)]" />
          Редактировать
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => void duplicateProduct(product.id)}>
          <Copy className="mr-2 h-4 w-4 text-[var(--cf-icon)]" />
          Дублировать
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-[var(--cf-border)]" />

        <DropdownMenuItem
          onClick={() => void updateProductStatus(product.id, 'active')}
        >
          <ShieldCheck className="mr-2 h-4 w-4 text-[var(--cf-icon)]" />
          Сделать Active
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => void updateProductStatus(product.id, 'draft')}
        >
          <NotepadTextDashed className="mr-2 h-4 w-4 text-[var(--cf-icon)]" />
          Сделать Draft
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => void updateProductStatus(product.id, 'archived')}
        >
          <Archive className="mr-2 h-4 w-4 text-[var(--cf-icon)]" />
          Архивировать
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-[var(--cf-border)]" />

        <DropdownMenuItem
          className="text-[var(--cf-red)]"
          onClick={() => {
            const confirmed = window.confirm('Удалить товар?')

            if (!confirmed) return

            void deleteProduct(product.id)
          }}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Удалить товар
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
