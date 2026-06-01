'use client'

import { ImageIcon } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { CrmMoneyPair } from '@/shared/ui/crm-money-pair'
import { SelectCheckbox } from '@/shared/ui/select-checkbox'
import type { CRMProduct } from '../model/products-types'
import { ProductStatusSelect } from './product-status-select'
import { ProductRowActionsMenu } from './product-row-actions-menu'

type ProductsTableProps = {
  products: CRMProduct[]
  selectedProductId: string | null
  selectedProductIds: string[]
  onSelect: (productId: string) => void
  onToggleProduct: (productId: string) => void
  onToggleAll: () => void
}

export function ProductsTable({
  products,
  selectedProductId,
  selectedProductIds,
  onSelect,
  onToggleProduct,
  onToggleAll
}: ProductsTableProps) {
const allSelected =
  products.length > 0 &&
  products.every(product => selectedProductIds.includes(product.id))

  return (
    <section className="cf-panel min-h-0 overflow-hidden">
      <div className="h-[calc(100vh-190px)] overflow-auto">
        <table className="w-max min-w-[1660px] border-separate border-spacing-0">
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

              <Head className="min-w-[130px]">sku</Head>
              <Head className="min-w-[280px]">product</Head>
              <Head className="min-w-[180px]">category</Head>
              <Head className="min-w-[150px]">status</Head>
              <Head className="min-w-[90px]">unit</Head>
              <Head className="min-w-[170px]">price</Head>
              <Head className="min-w-[170px]">cost</Head>
              <Head className="min-w-[140px]">stock mode</Head>
              <Head className="min-w-[100px]">stock</Head>
              <Head className="min-w-[140px]">production</Head>
              <Head className="min-w-[120px]">delivery</Head>
              <Head className="min-w-[110px]">images</Head>
              <Head className="min-w-[150px]">updated</Head>

              <th className="sticky right-0 top-0 z-50 h-9 w-[74px] min-w-[74px] bg-[var(--cf-panel-soft)] px-3 text-center text-[11px] text-[var(--cf-text-muted)] shadow-[-2px_0_2px_rgba(0,0,0,0.05)]">
                options
              </th>
            </tr>
          </thead>

          <tbody>
            {products.map((product, index) => {
              const checked = selectedProductIds.includes(product.id)

              return (
                <tr
                  key={product.id}
                  onClick={() => onSelect(product.id)}
                  className={cn(
                    'group cursor-pointer',
                    selectedProductId === product.id && 'is-selected'
                  )}
                >
                  <Cell className="sticky left-0 z-30 w-[52px] min-w-[52px] group-hover:bg-[var(--cf-table-row-hover)]">
                    <div
                      onClick={event => event.stopPropagation()}
                      onPointerDown={event => event.stopPropagation()}
                    >
                      <SelectCheckbox
                        checked={checked}
                        onCheckedChange={() => onToggleProduct(product.id)}
                      />
                    </div>
                  </Cell>

                  <Cell className="sticky left-[52px] z-30 w-[56px] min-w-[56px] shadow-[2px_0_2px_rgba(0,0,0,0.05)] group-hover:bg-[var(--cf-table-row-hover)]">
                    {index + 1}
                  </Cell>

                  <Cell className="min-w-[130px] font-medium">{product.sku}</Cell>

                  <Cell className="min-w-[280px] max-w-[280px]">
                    <div className="truncate font-medium">{product.name}</div>
                    <div className="truncate text-[10px] opacity-60">
                      {product.managerNote ?? product.description ?? '—'}
                    </div>
                  </Cell>

                  <Cell className="min-w-[180px]">{product.categoryName}</Cell>

                  <Cell className="min-w-[150px]">
                    <ProductStatusSelect product={product} variant="table" />
                  </Cell>

                  <Cell className="min-w-[90px]">{product.unit}</Cell>

                  <Cell className="min-w-[170px]">
                    <CrmMoneyPair value={product.price} displayMode="dual" />
                  </Cell>

                  <Cell className="min-w-[170px]">
                    {product.costPrice ? (
                      <CrmMoneyPair value={product.costPrice} displayMode="dual" />
                    ) : (
                      '—'
                    )}
                  </Cell>

                  <Cell className="min-w-[140px]">{product.stockMode}</Cell>
                  <Cell className="min-w-[100px]">{product.stockQty ?? '—'}</Cell>
                  <Cell className="min-w-[140px]">
                    {product.productionLeadTimeDays} days
                  </Cell>
                  <Cell className="min-w-[120px]">
                    {product.deliveryLeadTimeDays} days
                  </Cell>

                  <Cell className="min-w-[110px]">
                    <div className="flex items-center gap-1">
                      <ImageIcon className="h-3.5 w-3.5 opacity-70" />
                      {product.images.length}
                    </div>
                  </Cell>

                  <Cell className="min-w-[150px]">{product.updatedAt}</Cell>

                  <Cell className="sticky right-0 z-30 w-[74px] min-w-[74px] text-center shadow-[-2px_0_2px_rgba(0,0,0,0.05)] group-hover:bg-[var(--cf-table-row-hover)]">
                    <ProductRowActionsMenu
                      product={product}
                      onOpen={() => onSelect(product.id)}
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