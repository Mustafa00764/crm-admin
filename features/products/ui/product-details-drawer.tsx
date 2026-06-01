'use client'

import * as React from 'react'
import { ImageIcon, ImagePlus, Link, Star, Trash2, X } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { CrmMoneyPair } from '@/shared/ui/crm-money-pair'
import { cn } from '@/shared/lib/cn'
import { useCloseOnEscape } from '@/shared/hooks/use-close-on-escape'
import { useCRMStore } from '@/entities/crm/model/crm-store'
import type {
  CreateProductPayload,
  CRMProduct,
  ProductCategory,
  ProductCharacteristic,
  ProductImage,
  ProductStatus,
  ProductStockMode,
  ProductUnit
} from '../model/products-types'
import {
  productStockModes,
  productStatuses,
  productUnits
} from '../model/products-types'
import type { MoneyPair } from '@/features/orders/model/orders-types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/ui/select'

const RUB_TO_UZS_RATE = 138

const DEFAULT_PRODUCT_BACKGROUND =
  'linear-gradient(135deg, rgba(8,183,239,0.18), rgba(255,255,255,0.045) 42%, rgba(34,197,94,0.12))'

function money(rub: number): MoneyPair {
  return {
    rub,
    uzs: Math.round(rub * RUB_TO_UZS_RATE)
  }
}

function parseMoney(value: string) {
  const parsed = Number(
    value
      .replace(/\s/g, '')
      .replace(',', '.')
      .replace(/[^\d.]/g, '')
  )

  return Number.isNaN(parsed) ? 0 : parsed
}

function parseCharacteristics(value: string): ProductCharacteristic[] {
  return value
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [name, ...rest] = line.split(':')

      return {
        id: `pch_form_${index}`,
        name: name.trim() || `Field ${index + 1}`,
        value: rest.join(':').trim() || '—'
      }
    })
}

function stringifyCharacteristics(items: ProductCharacteristic[]) {
  return items.map(item => `${item.name}: ${item.value}`).join('\n')
}

function createImageId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `product_image_${crypto.randomUUID()}`
  }

  return `product_image_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

function createProductImage(url: string, isSelect = false): ProductImage {
  return {
    id: createImageId(),
    url,
    isSelect
  }
}

function normalizeProductImages(
  images: Array<ProductImage | string> | undefined
): ProductImage[] {
  const normalizedImages = (images ?? [])
    .map((image, index) => {
      if (typeof image === 'string') {
        return createProductImage(image, index === 0)
      }

      return {
        id: image.id || createImageId(),
        url: image.url,
        isSelect: Boolean(image.isSelect)
      }
    })
    .filter(image => image.url.trim().length > 0)

  if (normalizedImages.length === 0) {
    return []
  }

  const selectedIndex = normalizedImages.findIndex(image => image.isSelect)
  const safeSelectedIndex = selectedIndex >= 0 ? selectedIndex : 0

  return normalizedImages.map((image, index) => ({
    ...image,
    url: image.url.trim(),
    isSelect: index === safeSelectedIndex
  }))
}

const MAX_PRODUCT_IMAGE_SIZE = 1080
const PRODUCT_IMAGE_QUALITY = 0.68

function readImageFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Invalid image file'))
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      const source = reader.result

      if (typeof source !== 'string') {
        reject(new Error('Image read error'))
        return
      }

      const image = new Image()

      image.onload = () => {
        const width = image.naturalWidth || image.width
        const height = image.naturalHeight || image.height

        const scale = Math.min(
          1,
          MAX_PRODUCT_IMAGE_SIZE / width,
          MAX_PRODUCT_IMAGE_SIZE / height
        )

        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(width * scale))
        canvas.height = Math.max(1, Math.round(height * scale))

        const context = canvas.getContext('2d')

        if (!context) {
          reject(new Error('Canvas context error'))
          return
        }

        context.drawImage(image, 0, 0, canvas.width, canvas.height)

        const compressedImage = canvas.toDataURL(
          'image/webp',
          PRODUCT_IMAGE_QUALITY
        )

        resolve(compressedImage)
      }

      image.onerror = () => reject(new Error('Image decode error'))
      image.src = source
    }

    reader.onerror = () => reject(new Error('Image read error'))
    reader.readAsDataURL(file)
  })
}
export function ProductDetailsDrawer({
  open,
  product,
  categories,
  onClose
}: {
  open: boolean
  product: CRMProduct | null
  categories: ProductCategory[]
  onClose: () => void
}) {
  useCloseOnEscape({ open, onClose })

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 transition-[visibility] duration-200',
        open ? 'visible' : 'invisible'
      )}
      aria-hidden={!open}
    >
      <div
        className={cn(
          'absolute inset-0 bg-black/45 transition-opacity duration-200 ease-out',
          open ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          'absolute right-0 top-0 h-full w-full max-w-[820px] overflow-y-auto border-l border-[var(--cf-border)] bg-[var(--cf-bg)] p-4 shadow-2xl',
          'transition-all duration-200 ease-out will-change-transform',
          open ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-wide text-[var(--cf-text-muted)]">
              Product details
            </div>

            <h2 className="mt-1 text-[18px] font-semibold text-[var(--cf-text)]">
              {product ? product.sku : 'Create product'}
            </h2>

            <p className="mt-1 text-[12px] text-[var(--cf-text-muted)]">
              {product ? product.name : 'Новый товар каталога'}
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            className="cf-icon-button"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {product ? (
          <div className="mb-3 grid grid-cols-4 gap-2">
            <Metric
              label="Price"
              value={<CrmMoneyPair value={product.price} displayMode="dual" />}
            />

            <Metric
              label="Cost"
              value={
                product.costPrice ? (
                  <CrmMoneyPair value={product.costPrice} displayMode="dual" />
                ) : (
                  '—'
                )
              }
            />

            <Metric label="Stock" value={String(product.stockQty ?? '—')} />

            <Metric
              label="Delivery"
              value={`${product.deliveryLeadTimeDays} days`}
            />
          </div>
        ) : null}

        <ProductFormPanel
          key={product?.id ?? 'create-product'}
          product={product}
          categories={categories}
          onSaved={onClose}
        />
      </aside>
    </div>
  )
}

function ProductFormPanel({
  product,
  categories,
  onSaved
}: {
  product: CRMProduct | null
  categories: ProductCategory[]
  onSaved: () => void
}) {
  const { createProduct, updateProduct } = useCRMStore()

  const initialImages = normalizeProductImages(
    product?.images as Array<ProductImage | string> | undefined
  )

  const [sku, setSku] = React.useState(product?.sku ?? '')
  const [name, setName] = React.useState(product?.name ?? '')
  const [categoryId, setCategoryId] = React.useState(
    product?.categoryId ?? categories[0]?.id ?? ''
  )
  const [status, setStatus] = React.useState<ProductStatus>(
    product?.status ?? 'draft'
  )
  const [unit, setUnit] = React.useState<ProductUnit>(product?.unit ?? 'm2')
  const [priceRub, setPriceRub] = React.useState(
    product ? String(product.price.rub) : ''
  )
  const [costRub, setCostRub] = React.useState(
    product?.costPrice ? String(product.costPrice.rub) : ''
  )
  const [stockMode, setStockMode] = React.useState<ProductStockMode>(
    product?.stockMode ?? 'production'
  )
  const [stockQty, setStockQty] = React.useState(
    product?.stockQty ? String(product.stockQty) : ''
  )
  const [productionLeadTimeDays, setProductionLeadTimeDays] = React.useState(
    String(product?.productionLeadTimeDays ?? 1)
  )
  const [deliveryLeadTimeDays, setDeliveryLeadTimeDays] = React.useState(
    String(product?.deliveryLeadTimeDays ?? 4)
  )
  const [characteristics, setCharacteristics] = React.useState(
    product ? stringifyCharacteristics(product.characteristics) : ''
  )
  const [productImages, setProductImages] =
    React.useState<ProductImage[]>(initialImages)

  const productImagesRef = React.useRef<ProductImage[]>(initialImages)

  const [description, setDescription] = React.useState(
    product?.description ?? ''
  )
  const [managerNote, setManagerNote] = React.useState(
    product?.managerNote ?? ''
  )
  const [pending, setPending] = React.useState(false)

  const handleImagesDraftChange = React.useCallback(
    (nextImages: ProductImage[]) => {
      productImagesRef.current = nextImages
    },
    []
  )

  const handleImagesChange = React.useCallback((nextImages: ProductImage[]) => {
    const normalizedImages = normalizeProductImages(nextImages)

    productImagesRef.current = normalizedImages
    setProductImages(normalizedImages)
  }, [])

  const canSave =
    sku.trim().length > 0 &&
    name.trim().length > 0 &&
    categoryId.length > 0 &&
    parseMoney(priceRub) > 0 &&
    !pending

  const save = async () => {
    if (!canSave) return

    const costValue = parseMoney(costRub)
    const stockValue = Number(stockQty)
    const normalizedImages = normalizeProductImages(productImagesRef.current)

    const payload: CreateProductPayload = {
      sku: sku.trim(),
      name: name.trim(),
      categoryId,
      status,
      unit,
      price: money(parseMoney(priceRub)),
      stockMode,
      productionLeadTimeDays: Number(productionLeadTimeDays) || 1,
      deliveryLeadTimeDays: Number(deliveryLeadTimeDays) || 1,
      characteristics: parseCharacteristics(characteristics),
      images: normalizedImages,
      ...(costValue > 0 ? { costPrice: money(costValue) } : {}),
      ...(stockQty.trim()
        ? { stockQty: Number.isNaN(stockValue) ? 0 : stockValue }
        : {}),
      ...(description.trim() ? { description: description.trim() } : {}),
      ...(managerNote.trim() ? { managerNote: managerNote.trim() } : {})
    }

    setPending(true)

    try {
      if (product) {
        await updateProduct(product.id, payload)
      } else {
        await createProduct(payload)
      }

      onSaved()
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="rounded-md border border-[var(--cf-border)] bg-[var(--cf-element)] p-3">
      <h3 className="mb-3 text-[13px] font-semibold text-[var(--cf-text)]">
        {product ? 'Edit product' : 'Create product'}
      </h3>

      <ProductImageCards
        images={productImages}
        onDraftChange={handleImagesDraftChange}
        onChange={handleImagesChange}
      />

      <div className="mt-3 grid grid-cols-2 gap-2">
        <input
          value={sku}
          onChange={event => setSku(event.target.value)}
          placeholder="SKU"
          className="cf-control h-8 px-2 text-[11px] outline-none"
        />

        <input
          value={name}
          onChange={event => setName(event.target.value)}
          placeholder="Product name"
          className="cf-control h-8 px-2 text-[11px] outline-none"
        />

        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="cf-control w-full px-3 shadow-none">
            <SelectValue placeholder="Category" />
          </SelectTrigger>

          <SelectContent className="cf-panel">
            {categories.map(category => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={status}
          onValueChange={value => setStatus(value as ProductStatus)}
        >
          <SelectTrigger className="cf-control w-full px-3 shadow-none">
            <SelectValue placeholder="Status" />
          </SelectTrigger>

          <SelectContent className="cf-panel">
            {productStatuses.map(item => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={unit}
          onValueChange={value => setUnit(value as ProductUnit)}
        >
          <SelectTrigger className="cf-control w-full px-3 shadow-none">
            <SelectValue />
          </SelectTrigger>

          <SelectContent className="cf-panel">
            {productUnits.map(item => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={stockMode}
          onValueChange={value => setStockMode(value as ProductStockMode)}
        >
          <SelectTrigger className="cf-control w-full px-3 shadow-none">
            <SelectValue />
          </SelectTrigger>

          <SelectContent className="cf-panel">
            {productStockModes.map(item => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <input
          value={priceRub}
          onChange={event => setPriceRub(event.target.value)}
          placeholder="Price RUB"
          className="cf-control h-8 px-2 text-[11px] outline-none"
        />

        <input
          value={costRub}
          onChange={event => setCostRub(event.target.value)}
          placeholder="Cost price RUB"
          className="cf-control h-8 px-2 text-[11px] outline-none"
        />

        <input
          value={stockQty}
          onChange={event => setStockQty(event.target.value)}
          placeholder="Stock qty"
          className="cf-control h-8 px-2 text-[11px] outline-none"
        />

        <input
          value={productionLeadTimeDays}
          onChange={event => setProductionLeadTimeDays(event.target.value)}
          placeholder="Production days"
          className="cf-control h-8 px-2 text-[11px] outline-none"
        />

        <input
          value={deliveryLeadTimeDays}
          onChange={event => setDeliveryLeadTimeDays(event.target.value)}
          placeholder="Delivery days"
          className="cf-control h-8 px-2 text-[11px] outline-none"
        />

        <input
          value={managerNote}
          onChange={event => setManagerNote(event.target.value)}
          placeholder="Manager note"
          className="cf-control h-8 px-2 text-[11px] outline-none"
        />

        <textarea
          value={characteristics}
          onChange={event => setCharacteristics(event.target.value)}
          placeholder={'Characteristics\nТолщина: 100 мм\nПокрытие: ПЭ'}
          className="min-h-[110px] resize-none rounded-md border border-[var(--cf-border)] bg-[var(--cf-element)] px-3 py-2 text-[12px] text-[var(--cf-text)] outline-none placeholder:text-[var(--cf-text-muted)]"
        />

        <textarea
          value={description}
          onChange={event => setDescription(event.target.value)}
          placeholder="Description"
          className="min-h-[110px] resize-none rounded-md border border-[var(--cf-border)] bg-[var(--cf-element)] px-3 py-2 text-[12px] text-[var(--cf-text)] outline-none placeholder:text-[var(--cf-text-muted)]"
        />
      </div>

      <div className="mt-3 flex justify-end">
        <Button
          type="button"
          variant="ghost"
          disabled={!canSave}
          className="h-8 rounded-md bg-[var(--cf-button)] px-3 text-[11px] text-[var(--cf-text)] disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => void save()}
        >
          {product ? 'Save product' : 'Create product'}
        </Button>
      </div>
    </section>
  )
}

function ProductImageCards({
  images,
  onDraftChange,
  onChange
}: {
  images: ProductImage[]
  onDraftChange: (images: ProductImage[]) => void
  onChange: (images: ProductImage[]) => void
}) {
  const fileInputId = React.useId()
  const [urlValue, setUrlValue] = React.useState('')
  const [uploading, setUploading] = React.useState(false)
  const [draftImages, setDraftImages] = React.useState<ProductImage[]>(
    () => images
  )

  const commitImages = (nextImages: ProductImage[]) => {
    const normalizedImages = normalizeProductImages(nextImages)

    setDraftImages(normalizedImages)
    onDraftChange(normalizedImages)
    onChange(normalizedImages)
  }

  const addUrl = () => {
    const nextUrl = urlValue.trim()

    if (!nextUrl) return

    const nextImages = [
      ...draftImages,
      createProductImage(nextUrl, draftImages.length === 0)
    ]

    commitImages(nextImages)
    setUrlValue('')
  }

  const addFiles = async (fileList: FileList | null) => {
    if (!fileList?.length) return

    // Ограничь количество файлов до 6, чтобы не перегружать интерфейс и не допустить долгую загрузку при выборе большого количества фотографий
    const files = Array.from(fileList)
      .filter(file => file.type.startsWith('image/'))
      .slice(0, 6)

    if (files.length === 0) return

    setUploading(true)

    try {
      const uploadedUrls = await Promise.all(files.map(readImageFile))

      const nextImages = [
        ...draftImages,
        ...uploadedUrls.map((url, index) =>
          createProductImage(url, draftImages.length === 0 && index === 0)
        )
      ]

      commitImages(nextImages)
    } finally {
      setUploading(false)
    }
  }

  const updateImageUrlDraft = (imageId: string, value: string) => {
    const nextImages = draftImages.map(image =>
      image.id === imageId ? { ...image, url: value } : image
    )

    setDraftImages(nextImages)
    onDraftChange(nextImages)
  }

  const commitDraftImages = () => {
    commitImages(draftImages)
  }

  const removeImage = (imageId: string) => {
    const nextImages = draftImages.filter(image => image.id !== imageId)

    commitImages(nextImages)
  }

  const makePoster = (imageId: string) => {
    const nextImages = draftImages.map(image => ({
      ...image,
      isSelect: image.id === imageId
    }))

    commitImages(nextImages)
  }

  return (
    <section className="rounded-md border border-(--cf-border) bg-(--cf-bg)/30 p-3">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-[12px] font-semibold text-(--cf-text)">
            Images
          </div>

          <div className="mt-0.5 text-[10px] text-(--cf-text-muted)">
            Необязательно. Картинка с isSelect=true используется как poster.
          </div>
        </div>

        <div className="rounded-md bg-(--cf-element) px-2 py-1 text-[10px] text-(--cf-text-muted)">
          {draftImages.length} images
        </div>
      </div>

      <div className="mb-3 grid grid-cols-[1fr_auto_auto] gap-2">
        <div className="relative">
          <Link className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-(--cf-icon)" />

          <input
            value={urlValue}
            onChange={event => setUrlValue(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                event.preventDefault()
                addUrl()
              }
            }}
            placeholder="Paste image URL..."
            className="cf-control h-8 w-full pl-8 pr-2 text-[11px] outline-none"
          />
        </div>

        <Button
          type="button"
          variant="ghost"
          disabled={!urlValue.trim()}
          className="h-8 rounded-md bg-(--cf-button) px-3 text-[11px] text-(--cf-text) disabled:cursor-not-allowed disabled:opacity-50"
          onClick={addUrl}
        >
          Add URL
        </Button>

        <input
          id={fileInputId}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={event => {
            void addFiles(event.target.files)
            event.target.value = ''
          }}
        />

        <label
          htmlFor={fileInputId}
          className={cn(
            'inline-flex h-8 cursor-pointer items-center rounded-md bg-(--cf-button) px-3 text-[11px] text-(--cf-text) hover:bg-(--cf-element-hover)',
            uploading && 'pointer-events-none opacity-60'
          )}
        >
          <ImagePlus className="mr-1.5 h-3.5 w-3.5" />
          {uploading ? 'Uploading...' : 'Upload'}
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {draftImages.length === 0 ? <ProductEmptyImageCard /> : null}

        {draftImages.map(image => {
          const previewImage = image.url.trim()

          return (
            <article
              key={image.id}
              className={cn(
                'rounded-xl border bg-(--cf-element) p-2 transition',
                image.isSelect
                  ? 'border-(--cf-blue) shadow-[0_0_0_1px_var(--cf-blue)]'
                  : 'border-(--cf-border) hover:border-(--cf-blue)/70'
              )}
            >
              <button
                type="button"
                className="relative block aspect-video w-full overflow-hidden rounded-lg border border-(--cf-border) bg-cover bg-center text-left outline-none"
                style={
                  previewImage
                    ? {
                        backgroundImage: `url(${JSON.stringify(previewImage)})`
                      }
                    : { background: DEFAULT_PRODUCT_BACKGROUND }
                }
                onClick={() => makePoster(image.id)}
              >
                {!previewImage ? (
                  <div className="flex h-full items-center justify-center text-[var(--cf-text-muted)]">
                    <ImageIcon className="h-7 w-7" />
                  </div>
                ) : null}

                <div className="absolute left-2 top-2">
                  {image.isSelect ? (
                    <span className="rounded-md bg-(--cf-blue) px-2 py-1 text-[10px] text-white">
                      poster
                    </span>
                  ) : (
                    <span className="rounded-md bg-black/70 px-2 py-1 text-[10px] text-white">
                      click to poster
                    </span>
                  )}
                </div>

                <div className="absolute right-2 top-2 flex gap-1">
                  <span
                    role="button"
                    tabIndex={0}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-black/65 text-white hover:bg-black/85"
                    title="Make poster"
                    onClick={event => {
                      event.stopPropagation()
                      makePoster(image.id)
                    }}
                  >
                    {image.isSelect ? (
                      <Star fill='var(--cf-yellow)' stroke='var(--cf-yellow)' className='h-4 w-4' />
                    ) : (
                      <Star className="h-4 w-4" />
                    )}
                  </span>

                  <span
                    role="button"
                    tabIndex={0}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-black/65 text-white hover:bg-black/85"
                    title="Remove image"
                    onClick={event => {
                      event.stopPropagation()
                      removeImage(image.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </span>
                </div>
              </button>

              <input
                value={image.url}
                onChange={event =>
                  updateImageUrlDraft(image.id, event.target.value)
                }
                onBlur={commitDraftImages}
                title={image.url}
                placeholder="Image URL"
                className="mt-2 h-8 w-full truncate rounded-md border border-(--cf-border) bg-(--cf-element) px-2 text-[10px] text-(--cf-text) outline-none placeholder:text-(--cf-text-muted)"
              />
            </article>
          )
        })}
      </div>
    </section>
  )
}

function ProductEmptyImageCard() {
  return (
    <article className="rounded-xl border border-dashed border-(--cf-border) bg-(--cf-element) p-2">
      <div
        className="flex w-full aspect-video items-center justify-center rounded-lg border border-(--cf-border)"
        style={{ background: DEFAULT_PRODUCT_BACKGROUND }}
      >
        <div className="flex flex-col items-center gap-2 text-(--cf-text-muted)">
          <ImageIcon className="h-7 w-7" />

          <span className="text-[11px]">Default background</span>
        </div>
      </div>

      <div className="mt-2 h-8 truncate rounded-md border border-(--cf-border) bg-(--cf-element) px-2 text-[10px] leading-8 text-(--cf-text-muted)">
        No image URL
      </div>
    </article>
  )
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md border border-[var(--cf-border)] bg-[var(--cf-element)] p-3">
      <div className="text-[10px] uppercase tracking-wide text-[var(--cf-text-muted)]">
        {label}
      </div>

      <div className="mt-1 text-[13px] font-semibold text-[var(--cf-text)]">
        {value}
      </div>
    </div>
  )
}
