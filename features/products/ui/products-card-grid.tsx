'use client'

import { ImageIcon, Package } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { CrmMoneyPair } from '@/shared/ui/crm-money-pair'
import { SelectCheckbox } from '@/shared/ui/select-checkbox'
import type { CRMProduct } from '../model/products-types'
import { ProductRowActionsMenu } from './product-row-actions-menu'

const DEFAULT_PRODUCT_BACKGROUND =
  'linear-gradient(135deg, rgba(8,183,239,0.18), rgba(255,255,255,0.045) 42%, rgba(34,197,94,0.12))'

export function ProductsCardGrid({
  products,
  selectedProductIds,
  onSelect,
  onToggleProduct
}: {
  products: CRMProduct[]
  selectedProductIds: string[]
  onSelect: (productId: string) => void
  onToggleProduct: (productId: string) => void
}) {
  if (products.length === 0) {
    return (
      <section className="cf-panel flex min-h-80 items-center justify-center text-[12px] text-(--cf-text-muted)">
        Products not found
      </section>
    )
  }

  return (
    <section className="grid grid-cols-3 gap-3 pb-4 2xl:grid-cols-4">
      {products.map(product => {
        const checked = selectedProductIds.includes(product.id)
        const posterImage =
          product.images.find(image => image.isSelect)?.url ??
          product.images[0]?.url

        return (
          <article
            key={product.id}
            onClick={() => onSelect(product.id)}
            className={cn(
              'cf-panel cursor-pointer p-3 transition-all duration-200 hover:-translate-y-1 hover:bg-(--cf-element)/50',
              checked &&
                'border-(--cf-blue) bg-[rgba(8,183,239,0.09)] shadow-[0_0_0_1px_var(--cf-blue)]'
            )}
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className='flex items-start gap-2'>
                <div
                  className="flex shrink-0 items-center gap-1 "
                  onClick={event => event.stopPropagation()}
                  onPointerDown={event => event.stopPropagation()}
                >
                  <SelectCheckbox
                    checked={checked}
                    onCheckedChange={() => onToggleProduct(product.id)}
                  />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-semibold text-(--cf-text)">
                    {product.sku}
                  </div>

                  <div className="mt-0.5 truncate text-[11px] text-(--cf-text-muted)">
                    {product.categoryName}
                  </div>
                </div>
              </div>

              <div
                className="flex shrink-0 items-center gap-1 [&_svg]:text-primary"
                onClick={event => event.stopPropagation()}
                onPointerDown={event => event.stopPropagation()}
              >
                <ProductRowActionsMenu
                  product={product}
                  onOpen={() => onSelect(product.id)}
                />
              </div>
            </div>

            <div
              className="mb-3 flex w-full aspect-video items-center justify-center overflow-hidden rounded-lg border border-(--cf-border) bg-cover bg-center"
              style={
                posterImage
                  ? {
                      backgroundImage: `url(${JSON.stringify(posterImage)})`
                    }
                  : {
                      background: DEFAULT_PRODUCT_BACKGROUND
                    }
              }
            >
              {!posterImage ? (
                <div className="flex flex-col items-center gap-1 text-(--cf-text-muted)">
                  <ImageIcon className="h-6 w-6" />
                  <span className="text-[10px]">No image</span>
                </div>
              ) : null}
            </div>

            <div className="mb-3 min-h-10 text-[13px] font-medium leading-5 text-(--cf-text)">
              {product.name}
            </div>

            <div className="mb-3 grid grid-cols-2 gap-2">
              <Info label="Price">
                <CrmMoneyPair value={product.price} displayMode="dual" />
              </Info>

              <Info label="Cost">
                {product.costPrice ? (
                  <CrmMoneyPair value={product.costPrice} displayMode="dual" />
                ) : (
                  '—'
                )}
              </Info>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <Meta icon={<Package className="h-3.5 w-3.5" />} label="Mode">
                {product.stockMode}
              </Meta>

              <Meta icon={<ImageIcon className="h-3.5 w-3.5" />} label="Images">
                {product.images.length}
              </Meta>

              <Meta label="Production">
                {product.productionLeadTimeDays} days
              </Meta>

              <Meta label="Delivery">{product.deliveryLeadTimeDays} days</Meta>
            </div>

            <div className="mt-3 rounded-md border border-(--cf-border) bg-(--cf-element)/50 p-2">
              <div className="truncate text-[11px] text-(--cf-text)">
                {product.status}
              </div>

              <div className="mt-0.5 truncate text-[10px] text-(--cf-text-muted)">
                {product.unit} · stock: {product.stockQty ?? '—'}
              </div>
            </div>
          </article>
        )
      })}
    </section>
  )
}

function Info({
  label,
  children
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-md border border-(--cf-border) bg-(--cf-element)/50 p-2">
      <div className="text-[10px] text-(--cf-text-muted)">{label}</div>

      <div className="mt-1 text-[11px] font-medium text-(--cf-text)">
        {children}
      </div>
    </div>
  )
}

function Meta({
  icon,
  label,
  children
}: {
  icon?: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-(--cf-border) bg-(--cf-element)/50 px-2 py-1.5 text-(--cf-text-muted)">
      {icon}

      <span className="min-w-0 truncate">
        {label}: <span className="text-(--cf-text)">{children}</span>
      </span>
    </div>
  )
}
