'use client'

import {
  Archive,
  Copy,
  ExternalLink,
  MoreVertical,
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
import type { ProductCategory } from '@/features/products/model/products-types'

export function ProductCategoryRowActionsMenu({
  category,
  productCount,
  onOpen
}: {
  category: ProductCategory
  productCount: number
  onOpen: () => void
}) {
  const {
    updateProductCategoryStatus,
    duplicateProductCategory,
    deleteProductCategory
  } = useCRMStore()

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
        className="cf-panel w-60"
        onClick={event => event.stopPropagation()}
      >
        <DropdownMenuItem onClick={onOpen}>
          <ExternalLink className="mr-2 h-4 w-4 text-(--cf-icon)" />
          Открыть категорию
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onOpen}>
          <Pencil className="mr-2 h-4 w-4 text-(--cf-icon)" />
          Редактировать
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => void duplicateProductCategory(category.id)}
        >
          <Copy className="mr-2 h-4 w-4 text-(--cf-icon)" />
          Дублировать
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-(--cf-border)" />

        <DropdownMenuItem
          onClick={() =>
            void updateProductCategoryStatus(category.id, 'active')
          }
        >
            <ShieldCheck className="mr-2 h-4 w-4 text-(--cf-icon)"/>
          Сделать Active
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() =>
            void updateProductCategoryStatus(category.id, 'archived')
          }
        >
          <Archive className="mr-2 h-4 w-4 text-(--cf-icon)" />
          Архивировать
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-(--cf-border)" />

        <DropdownMenuItem
          disabled={productCount > 0}
          className="text-(--cf-red) disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => {
            if (productCount > 0) return

            const confirmed = window.confirm('Удалить категорию?')

            if (!confirmed) return

            void deleteProductCategory(category.id)
          }}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {productCount > 0 ? 'Нельзя удалить: есть товары' : 'Удалить'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}