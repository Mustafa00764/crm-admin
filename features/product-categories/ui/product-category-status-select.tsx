'use client'

import * as React from 'react'
import { useCRMStore } from '@/entities/crm/model/crm-store'
import { cn } from '@/shared/lib/cn'
import {
  productCategoryStatuses,
  type ProductCategory,
  type ProductCategoryStatus
} from '@/features/products/model/products-types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/ui/select'

const statusDotColors: Record<ProductCategoryStatus, string> = {
  active: '#22c55e',
  archived: '#64748b'
}

export function ProductCategoryStatusSelect({
  category,
  variant = 'default'
}: {
  category: ProductCategory
  variant?: 'default' | 'table'
}) {
  const { updateProductCategoryStatus } = useCRMStore()
  const [pending, setPending] = React.useState(false)

  const isTable = variant === 'table'

  const handleChange = async (nextStatus: ProductCategoryStatus) => {
    if (pending) return
    if (nextStatus === category.status) return

    setPending(true)

    try {
      await updateProductCategoryStatus(category.id, nextStatus)
    } finally {
      setPending(false)
    }
  }

  return (
    <div
      onClick={event => event.stopPropagation()}
      onPointerDown={event => event.stopPropagation()}
    >
      <Select
        value={category.status}
        disabled={pending}
        onValueChange={value =>
          void handleChange(value as ProductCategoryStatus)
        }
      >
        <SelectTrigger
          className={cn(
            'h-7 w-full border px-2 text-[11px] outline-none focus:ring-0 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60',
            isTable
              ? 'border-(--cf-table-text)/15 bg-[rgba(255,255,255,0.24)] text-(--cf-table-text) hover:bg-[rgba(255,255,255,0.34)] [&_svg]:text-(--cf-table-text)/80'
              : 'border-(--cf-border) bg-(--cf-bg) text-primary [&_svg]:text-auto'
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="min-w-0 truncate">
              <SelectValue placeholder="Category status" />
            </span>
          </span>
        </SelectTrigger>

        <SelectContent className="border border-[var(--cf-border)] bg-[var(--cf-bg)] text-[var(--cf-text)]">
          {productCategoryStatuses.map(status => (
            <SelectItem
              key={status.value}
              value={status.value}
              textValue={status.label}
              className="text-[11px] focus:bg-[var(--cf-element-hover)] focus:text-[var(--cf-text)]"
            >
              <span className="flex items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: statusDotColors[status.value] }}
                />
                <span>{status.label}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}