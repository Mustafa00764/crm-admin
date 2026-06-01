'use client'

import { Search } from 'lucide-react'
import { useCRMStore } from '@/entities/crm/model/crm-store'
import type {
  ProductCategoryFilters,
  ProductCategoryStatus
} from '@/features/products/model/products-types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/ui/select'

export function ProductCategoriesFilters() {
  const {
    productCategories,
    productCategoryFilters,
    updateProductCategoryFilters
  } = useCRMStore()

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <SmallSelect
          value={productCategoryFilters.status}
          className="w-[140px]"
          onValueChange={value =>
            updateProductCategoryFilters({
              status: value as ProductCategoryStatus | 'all'
            })
          }
          items={[
            ['all', 'All statuses'],
            ['active', 'Active'],
            ['archived', 'Archived']
          ]}
        />

        <SmallSelect
          value={productCategoryFilters.parentId}
          className="w-[180px]"
          onValueChange={value =>
            updateProductCategoryFilters({ parentId: value })
          }
          items={[
            ['all', 'All parents'],
            ['root', 'Root categories'],
            ...productCategories.map(category => [
              category.id,
              category.name
            ] as [string, string])
          ]}
        />

        <SmallSelect
          value={productCategoryFilters.hasFilters}
          className="w-[140px]"
          onValueChange={value =>
            updateProductCategoryFilters({
              hasFilters: value as ProductCategoryFilters['hasFilters']
            })
          }
          items={[
            ['all', 'Filters'],
            ['yes', 'Has filters'],
            ['no', 'No filters']
          ]}
        />
      </div>

      <div className="relative w-full max-w-[430px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--cf-icon)]" />

        <input
          className="cf-control w-full pl-9 pr-3 outline-none placeholder:text-[var(--cf-text-muted)]"
          placeholder="Search category, slug, filter..."
          value={productCategoryFilters.search}
          onChange={event =>
            updateProductCategoryFilters({ search: event.target.value })
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
  className
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