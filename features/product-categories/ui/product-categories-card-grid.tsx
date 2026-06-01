'use client'

import { Filter, FolderTree, Package } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { SelectCheckbox } from '@/shared/ui/select-checkbox'
import type { ProductCategory } from '@/features/products/model/products-types'
import { ProductCategoryRowActionsMenu } from './product-category-row-actions-menu'

export function ProductCategoriesCardGrid({
  categories,
  selectedCategoryIds,
  productCountByCategoryId,
  onSelect,
  onToggleCategory
}: {
  categories: ProductCategory[]
  selectedCategoryIds: string[]
  productCountByCategoryId: Record<string, number>
  onSelect: (categoryId: string) => void
  onToggleCategory: (categoryId: string) => void
}) {
  if (categories.length === 0) {
    return (
      <section className="cf-panel flex min-h-80 items-center justify-center text-[12px] text-(--cf-text-muted)">
        Product categories not found
      </section>
    )
  }

  const getParentName = (parentId?: string) => {
    if (!parentId) return 'Root'

    return categories.find(category => category.id === parentId)?.name ?? '—'
  }

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 pb-4 flex-1 2xl:grid-cols-4">
      {categories.map(category => {
        const checked = selectedCategoryIds.includes(category.id)
        const productCount = productCountByCategoryId[category.id] ?? 0

        return (
          <article
            key={category.id}
            onClick={() => onSelect(category.id)}
            className={cn(
              'cf-panel cursor-pointer p-3 transition-[background-color,border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:bg-(--cf-element)',
              checked &&
                'border-(--cf-blue) bg-[rgba(8,183,239,0.09)] shadow-[0_0_0_1px_var(--cf-blue)]'
            )}
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className='flex items-start gap-2'>
                <div
                  className="flex shrink-0 items-center gap-1"
                  onClick={event => event.stopPropagation()}
                  onPointerDown={event => event.stopPropagation()}
                >
                  <SelectCheckbox
                    checked={checked}
                    onCheckedChange={() => onToggleCategory(category.id)}
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 truncate text-[13px] font-semibold text-(--cf-text)">
                    <FolderTree className="h-4 w-4 shrink-0 text-(--cf-icon)" />
                    <span className="truncate">{category.name}</span>
                  </div>

                  <div className="mt-0.5 truncate text-[11px] text-(--cf-text-muted)">
                    /{category.slug}
                  </div>
                </div>
              </div>

              <div
                className="flex shrink-0 items-center gap-1 [&_svg]:text-primary"
                onClick={event => event.stopPropagation()}
                onPointerDown={event => event.stopPropagation()}
              >

                <ProductCategoryRowActionsMenu
                  category={category}
                  productCount={productCount}
                  onOpen={() => onSelect(category.id)}
                />
              </div>
            </div>

            <div className="mb-3 flex flex-wrap gap-1.5">
              <span className="rounded-md bg-(--cf-button) px-2 py-1 text-[10px] text-(--cf-text)">
                {category.status}
              </span>

              <span className="rounded-md bg-(--cf-button) px-2 py-1 text-[10px] text-(--cf-text)">
                parent: {getParentName(category.parentId)}
              </span>
            </div>

            <div className="mb-3 min-h-10.5 line-clamp-2 text-[12px] leading-5 text-(--cf-text-muted)">
              {category.description ?? 'No description'}
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <Info icon={<Package className="h-3.5 w-3.5" />} label="Products">
                {productCount}
              </Info>

              <Info icon={<Filter className="h-3.5 w-3.5" />} label="Filters">
                {category.filters.length}
              </Info>
            </div>

            {category.filters.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {category.filters.slice(0, 4).map(filter => (
                  <span
                    key={filter.id}
                    className="rounded-md border border-(--cf-border) bg-(--cf-element) px-2 py-1 text-[10px] text-(--cf-icon)"
                  >
                    {filter.label}
                  </span>
                ))}
              </div>
            ) : null}
          </article>
        )
      })}
    </section>
  )
}

function Info({
  icon,
  label,
  children
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-md border border-(--cf-border) bg-(--cf-element) p-2">
      <div className="flex items-center gap-1.5 text-[10px] text-(--cf-text-muted)">
        {icon}
        {label}
      </div>

      <div className="mt-1 text-[12px] font-semibold text-(--cf-text)">
        {children}
      </div>
    </div>
  )
}
