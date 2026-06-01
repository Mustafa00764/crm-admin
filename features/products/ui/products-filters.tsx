'use client'

import { Search } from 'lucide-react'
import { useCRMStore } from '@/entities/crm/model/crm-store'
import type {
  ProductFilters,
  ProductStatus,
  ProductStockMode,
  ProductUnit
} from '../model/products-types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/ui/select'

export function ProductsFilters() {
  const { productsFilters, productCategories, updateProductsFilters } =
    useCRMStore()

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <SmallSelect
          value={productsFilters.status}
          className="w-[140px]"
          onValueChange={value =>
            updateProductsFilters({ status: value as ProductStatus | 'all' })
          }
          items={[
            ['all', 'All statuses'],
            ['active', 'Active'],
            ['draft', 'Draft'],
            ['archived', 'Archived'],
            ['out_of_stock', 'Out of stock']
          ]}
        />

        <SmallSelect
          value={productsFilters.categoryId}
          className="w-[180px]"
          onValueChange={value => updateProductsFilters({ categoryId: value })}
          items={[
            ['all', 'All categories'],
            ...productCategories.map(category => [category.id, category.name] as [string, string])
          ]}
        />

        <SmallSelect
          value={productsFilters.stockMode}
          className="w-[145px]"
          onValueChange={value =>
            updateProductsFilters({
              stockMode: value as ProductStockMode | 'all'
            })
          }
          items={[
            ['all', 'Stock mode'],
            ['stock', 'Stock'],
            ['production', 'Production'],
            ['mixed', 'Mixed'],
            ['preorder', 'Preorder']
          ]}
        />

        <SmallSelect
          value={productsFilters.unit}
          className="w-[110px]"
          onValueChange={value =>
            updateProductsFilters({ unit: value as ProductUnit | 'all' })
          }
          items={[
            ['all', 'Unit'],
            ['pcs', 'pcs'],
            ['m2', 'm²'],
            ['m', 'm'],
            ['kg', 'kg'],
            ['ton', 'ton'],
            ['set', 'set']
          ]}
        />

        <SmallSelect
          value={productsFilters.hasCostPrice}
          className="w-[130px]"
          onValueChange={value =>
            updateProductsFilters({
              hasCostPrice: value as ProductFilters['hasCostPrice']
            })
          }
          items={[
            ['all', 'Cost price'],
            ['yes', 'Has cost'],
            ['no', 'No cost']
          ]}
        />

        <SmallSelect
          value={productsFilters.hasImages}
          className="w-[120px]"
          onValueChange={value =>
            updateProductsFilters({
              hasImages: value as ProductFilters['hasImages']
            })
          }
          items={[
            ['all', 'Images'],
            ['yes', 'Has images'],
            ['no', 'No images']
          ]}
        />

        <input
          className="cf-control w-[120px] px-3 outline-none placeholder:text-[var(--cf-text-muted)]"
          placeholder="Price from"
          value={productsFilters.priceFrom}
          onChange={event =>
            updateProductsFilters({ priceFrom: event.target.value })
          }
        />

        <input
          className="cf-control w-[120px] px-3 outline-none placeholder:text-[var(--cf-text-muted)]"
          placeholder="Price to"
          value={productsFilters.priceTo}
          onChange={event =>
            updateProductsFilters({ priceTo: event.target.value })
          }
        />
      </div>

      <div className="relative w-full max-w-[430px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--cf-icon)]" />

        <input
          className="cf-control w-full pl-9 pr-3 outline-none placeholder:text-[var(--cf-text-muted)]"
          placeholder="Search product, sku, category..."
          value={productsFilters.search}
          onChange={event =>
            updateProductsFilters({ search: event.target.value })
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