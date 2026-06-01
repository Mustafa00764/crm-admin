'use client'

import { Filter, FolderTree } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { SelectCheckbox } from '@/shared/ui/select-checkbox'
import type { ProductCategory } from '@/features/products/model/products-types'
import { ProductCategoryStatusSelect } from './product-category-status-select'
import { ProductCategoryRowActionsMenu } from './product-category-row-actions-menu'

export function ProductCategoriesTable({
  categories,
  selectedCategoryId,
  selectedCategoryIds,
  productCountByCategoryId,
  onSelect,
  onToggleCategory,
  onToggleAll
}: {
  categories: ProductCategory[]
  selectedCategoryId: string | null
  selectedCategoryIds: string[]
  productCountByCategoryId: Record<string, number>
  onSelect: (categoryId: string) => void
  onToggleCategory: (categoryId: string) => void
  onToggleAll: () => void
}) {
  const allSelected =
    categories.length > 0 &&
    categories.every(category => selectedCategoryIds.includes(category.id))

  const getParentName = (parentId?: string) => {
    if (!parentId) return 'Root'

    return categories.find(category => category.id === parentId)?.name ?? '—'
  }

  return (
    <section className="cf-panel flex-1 min-h-0 overflow-hidden">
      <div className="h-full overflow-auto">
        <table className="w-max min-w-[1380px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="sticky left-0 top-0 z-50 h-9 w-[52px] min-w-[52px] bg-[var(--cf-panel-soft)] px-3 text-left">
                <SelectCheckbox
                  checked={allSelected}
                  onCheckedChange={onToggleAll}
                />
              </th>

              <th className="sticky left-[52px] top-0 z-50 h-9 w-[56px] min-w-[56px] bg-[var(--cf-panel-soft)] px-3 text-left text-[11px] text-[var(--cf-text-muted)] shadow-[2px_0_2px_rgba(0,0,0,0.05)]">
                #
              </th>

              <Head className="min-w-[230px]">category</Head>
              <Head className="min-w-[180px]">slug</Head>
              <Head className="min-w-[180px]">parent</Head>
              <Head className="min-w-[140px]">status</Head>
              <Head className="min-w-[110px]">products</Head>
              <Head className="min-w-[110px]">filters</Head>
              <Head className="min-w-[260px]">description</Head>
              <Head className="min-w-[150px]">created</Head>
              <Head className="min-w-[150px]">updated</Head>

              <th className="sticky right-0 top-0 z-50 h-9 w-[74px] min-w-[74px] bg-[var(--cf-panel-soft)] px-3 text-center text-[11px] text-[var(--cf-text-muted)] shadow-[-2px_0_2px_rgba(0,0,0,0.05)]">
                options
              </th>
            </tr>
          </thead>

          <tbody>
            {categories.map((category, index) => {
              const checked = selectedCategoryIds.includes(category.id)
              const productCount = productCountByCategoryId[category.id] ?? 0

              return (
                <tr
                  key={category.id}
                  onClick={() => onSelect(category.id)}
                  className={cn(
                    'group cursor-pointer',
                    selectedCategoryId === category.id && 'is-selected'
                  )}
                >
                  <Cell className="sticky left-0 z-30 w-[52px] min-w-[52px] group-hover:bg-[var(--cf-table-row-hover)]">
                    <div
                      onClick={event => event.stopPropagation()}
                      onPointerDown={event => event.stopPropagation()}
                    >
                      <SelectCheckbox
                        checked={checked}
                        onCheckedChange={() => onToggleCategory(category.id)}
                      />
                    </div>
                  </Cell>

                  <Cell className="sticky left-[52px] z-30 w-[56px] min-w-[56px] shadow-[2px_0_2px_rgba(0,0,0,0.05)] group-hover:bg-[var(--cf-table-row-hover)]">
                    {index + 1}
                  </Cell>

                  <Cell className="min-w-[230px] max-w-[230px]">
                    <div className="flex items-center gap-2">
                      <FolderTree className="h-4 w-4 shrink-0 opacity-70" />
                      <div className="min-w-0">
                        <div className="truncate font-medium">
                          {category.name}
                        </div>
                        <div className="truncate text-[10px] opacity-60">
                          {category.id}
                        </div>
                      </div>
                    </div>
                  </Cell>

                  <Cell className="min-w-[180px]">{category.slug}</Cell>
                  <Cell className="min-w-[180px]">
                    {getParentName(category.parentId)}
                  </Cell>

                  <Cell className="min-w-[140px]">
                    <ProductCategoryStatusSelect
                      category={category}
                      variant="table"
                    />
                  </Cell>

                  <Cell className="min-w-[110px]">{productCount}</Cell>

                  <Cell className="min-w-[110px]">
                    <div className="flex items-center gap-1">
                      <Filter className="h-3.5 w-3.5 opacity-70" />
                      {category.filters.length}
                    </div>
                  </Cell>

                  <Cell className="min-w-[260px] max-w-[260px]">
                    <div className="truncate">
                      {category.description ?? '—'}
                    </div>
                  </Cell>

                  <Cell className="min-w-[150px]">{category.createdAt}</Cell>
                  <Cell className="min-w-[150px]">{category.updatedAt}</Cell>

                  <Cell className="sticky right-0 z-30 w-[74px] min-w-[74px] text-center shadow-[-2px_0_2px_rgba(0,0,0,0.05)] group-hover:bg-[var(--cf-table-row-hover)]">
                    <ProductCategoryRowActionsMenu
                      category={category}
                      productCount={productCount}
                      onOpen={() => onSelect(category.id)}
                    />
                  </Cell>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function Head({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <th
      className={cn(
        'sticky top-0 z-40 h-9 bg-[var(--cf-panel-soft)] px-3 text-left text-[11px] font-medium text-[var(--cf-text-muted)]',
        className
      )}
    >
      {children}
    </th>
  )
}

function Cell({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <td
      className={cn(
        'h-[42px] border-b border-[rgba(255,255,255,0.06)] bg-[var(--cf-table-row)] px-3 text-[12px] text-[var(--cf-table-text)] transition group-even:bg-[var(--cf-table-row-alt)] group-hover:bg-[var(--cf-table-row-hover)]',
        className
      )}
    >
      {children}
    </td>
  )
}
