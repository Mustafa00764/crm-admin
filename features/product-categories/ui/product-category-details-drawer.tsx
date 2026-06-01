'use client'

import * as React from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/cn'
import { useCloseOnEscape } from '@/shared/hooks/use-close-on-escape'
import { useCRMStore } from '@/entities/crm/model/crm-store'
import type {
  CreateProductCategoryPayload,
  ProductCategory,
  ProductFilter,
  ProductFilterType,
  ProductCategoryStatus
} from '@/features/products/model/products-types'
import {
  productCategoryStatuses,
  productFilterTypes
} from '@/features/products/model/products-types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/ui/select'

type FilterDraft = {
  id: string
  key: string
  label: string
  type: ProductFilterType
  valuesText: string
  unit: string
}

function createFilterId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `filter_${crypto.randomUUID()}`
  }

  return `filter_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

function toFilterDraft(filter: ProductFilter): FilterDraft {
  return {
    id: filter.id,
    key: filter.key,
    label: filter.label,
    type: filter.type,
    valuesText: filter.values?.join(', ') ?? '',
    unit: filter.unit ?? ''
  }
}

function toProductFilter(draft: FilterDraft): ProductFilter | null {
  const key = draft.key.trim()
  const label = draft.label.trim()

  if (!key || !label) return null

  const values = draft.valuesText
    .split(',')
    .map(value => value.trim())
    .filter(Boolean)

  return {
    id: draft.id,
    key,
    label,
    type: draft.type,
    ...(values.length > 0 ? { values } : {}),
    ...(draft.unit.trim() ? { unit: draft.unit.trim() } : {})
  }
}

function slugify(value: string) {
  const map: Record<string, string> = {
    а: 'a',
    б: 'b',
    в: 'v',
    г: 'g',
    д: 'd',
    е: 'e',
    ё: 'e',
    ж: 'zh',
    з: 'z',
    и: 'i',
    й: 'y',
    к: 'k',
    л: 'l',
    м: 'm',
    н: 'n',
    о: 'o',
    п: 'p',
    р: 'r',
    с: 's',
    т: 't',
    у: 'u',
    ф: 'f',
    х: 'h',
    ц: 'c',
    ч: 'ch',
    ш: 'sh',
    щ: 'sch',
    ы: 'y',
    э: 'e',
    ю: 'yu',
    я: 'ya'
  }

  return value
    .trim()
    .toLowerCase()
    .split('')
    .map(char => map[char] ?? char)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function ProductCategoryDetailsDrawer({
  open,
  category,
  categories,
  productCount,
  onClose
}: {
  open: boolean
  category: ProductCategory | null
  categories: ProductCategory[]
  productCount: number
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
          'absolute right-0 top-0 h-full w-full max-w-[760px] overflow-y-auto border-l border-[var(--cf-border)] bg-[var(--cf-bg)] p-4 shadow-2xl',
          'transition-all duration-200 ease-out will-change-transform',
          open ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-wide text-[var(--cf-text-muted)]">
              Product category
            </div>

            <h2 className="mt-1 text-[18px] font-semibold text-[var(--cf-text)]">
              {category ? category.name : 'Create category'}
            </h2>

            <p className="mt-1 text-[12px] text-[var(--cf-text-muted)]">
              {category ? `/${category.slug}` : 'Новая категория каталога'}
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

        {category ? (
          <div className="mb-3 grid grid-cols-4 gap-2">
            <Metric label="Products" value={String(productCount)} />
            <Metric label="Filters" value={String(category.filters.length)} />
            <Metric label="Status" value={category.status} />
            <Metric
              label="Parent"
              value={
                category.parentId
                  ? categories.find(item => item.id === category.parentId)
                      ?.name ?? '—'
                  : 'Root'
              }
            />
          </div>
        ) : null}

        <ProductCategoryFormPanel
          key={category?.id ?? 'create-category'}
          category={category}
          categories={categories}
          onSaved={onClose}
        />
      </aside>
    </div>
  )
}

function ProductCategoryFormPanel({
  category,
  categories,
  onSaved
}: {
  category: ProductCategory | null
  categories: ProductCategory[]
  onSaved: () => void
}) {
  const { createProductCategory, updateProductCategory } = useCRMStore()

  const [name, setName] = React.useState(category?.name ?? '')
  const [slug, setSlug] = React.useState(category?.slug ?? '')
  const [parentId, setParentId] = React.useState(category?.parentId ?? 'none')
  const [status, setStatus] = React.useState<ProductCategoryStatus>(
    category?.status ?? 'active'
  )
  const [description, setDescription] = React.useState(
    category?.description ?? ''
  )
  const [filters, setFilters] = React.useState<FilterDraft[]>(
    () => category?.filters.map(toFilterDraft) ?? []
  )
  const [pending, setPending] = React.useState(false)

  const availableParents = categories.filter(item => item.id !== category?.id)

  const canSave = name.trim().length > 0 && !pending

  const addFilter = () => {
    setFilters(current => [
      ...current,
      {
        id: createFilterId(),
        key: '',
        label: '',
        type: 'text',
        valuesText: '',
        unit: ''
      }
    ])
  }

  const updateFilter = (
    filterId: string,
    payload: Partial<FilterDraft>
  ) => {
    setFilters(current =>
      current.map(filter =>
        filter.id === filterId ? { ...filter, ...payload } : filter
      )
    )
  }

  const removeFilter = (filterId: string) => {
    setFilters(current => current.filter(filter => filter.id !== filterId))
  }

  const save = async () => {
    if (!canSave) return

    const normalizedFilters = filters
      .map(toProductFilter)
      .filter((filter): filter is ProductFilter => Boolean(filter))

    const nextSlug = slug.trim() || slugify(name)

    const payload: CreateProductCategoryPayload = {
      name: name.trim(),
      slug: nextSlug,
      status,
      filters: normalizedFilters,
      ...(parentId !== 'none' ? { parentId } : {}),
      ...(description.trim() ? { description: description.trim() } : {})
    }

    setPending(true)

    try {
      if (category) {
        await updateProductCategory(category.id, payload)
      } else {
        await createProductCategory(payload)
      }

      onSaved()
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="rounded-md border border-[var(--cf-border)] bg-[var(--cf-element)] p-3">
      <h3 className="mb-3 text-[13px] font-semibold text-[var(--cf-text)]">
        {category ? 'Edit category' : 'Create category'}
      </h3>

      <div className="grid grid-cols-2 gap-2">
        <input
          value={name}
          onChange={event => {
            const nextName = event.target.value
            setName(nextName)

            if (!category && !slug.trim()) {
              setSlug(slugify(nextName))
            }
          }}
          placeholder="Category name"
          className="cf-control h-8 px-2 text-[11px] outline-none"
        />

        <input
          value={slug}
          onChange={event => setSlug(event.target.value)}
          placeholder="Slug"
          className="cf-control h-8 px-2 text-[11px] outline-none"
        />

        <Select value={parentId} onValueChange={setParentId}>
          <SelectTrigger className="cf-control w-full px-3 shadow-none">
            <SelectValue placeholder="Parent category" />
          </SelectTrigger>

          <SelectContent className="cf-panel">
            <SelectItem value="none">Root category</SelectItem>

            {availableParents.map(item => (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={status}
          onValueChange={value => setStatus(value as ProductCategoryStatus)}
        >
          <SelectTrigger className="cf-control w-full px-3 shadow-none">
            <SelectValue placeholder="Status" />
          </SelectTrigger>

          <SelectContent className="cf-panel">
            {productCategoryStatuses.map(item => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <textarea
          value={description}
          onChange={event => setDescription(event.target.value)}
          placeholder="Description"
          className="col-span-2 min-h-23 resize-none rounded-md border border-[var(--cf-border)] bg-[var(--cf-element)] px-3 py-2 text-[12px] text-[var(--cf-text)] outline-none placeholder:text-[var(--cf-text-muted)]"
        />
      </div>

      <div className="mt-4 rounded-md border border-(--cf-border) bg-(--cf-bg)/50 p-3">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <div className="text-[12px] font-semibold text-(--cf-text)">
              Category filters
            </div>

            <div className="mt-0.5 text-[10px] text-(--cf-text-muted)">
              Эти фильтры потом используются в товарах категории.
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            className="h-8 rounded-md bg-(--cf-button) px-3 text-[11px] text-(--cf-text)"
            onClick={addFilter}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add filter
          </Button>
        </div>

        <div className="space-y-2">
          {filters.length === 0 ? (
            <div className="rounded-md border border-dashed border-(--cf-border) bg-(--cf-element) px-3 py-6 text-center text-[11px] text-(--cf-text-muted)">
              No filters. Add filters like thickness, RAL, profile, coating.
            </div>
          ) : null}

          {filters.map(filter => (
            <div
              key={filter.id}
              className="rounded-md border border-(--cf-border) bg-(--cf-element) p-2"
            >
              <div className="grid grid-cols-[1fr_1fr_140px_90px_34px] gap-2">
                <input
                  value={filter.key}
                  onChange={event =>
                    updateFilter(filter.id, { key: event.target.value })
                  }
                  placeholder="key"
                  className="cf-control h-8 px-2 text-[11px] outline-none"
                />

                <input
                  value={filter.label}
                  onChange={event =>
                    updateFilter(filter.id, { label: event.target.value })
                  }
                  placeholder="label"
                  className="cf-control h-8 px-2 text-[11px] outline-none"
                />

                <Select
                  value={filter.type}
                  onValueChange={value =>
                    updateFilter(filter.id, {
                      type: value as ProductFilterType
                    })
                  }
                >
                  <SelectTrigger className="cf-control w-full px-3 shadow-none">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent className="cf-panel">
                    {productFilterTypes.map(item => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <input
                  value={filter.unit}
                  onChange={event =>
                    updateFilter(filter.id, { unit: event.target.value })
                  }
                  placeholder="unit"
                  className="cf-control h-8 px-2 text-[11px] outline-none"
                />

                <Button
                  type="button"
                  variant="ghost"
                  className="cf-icon-button h-7.5! w-7.5! text-(--cf-red)/70! hover:bg-(--cf-red)/20! hover:text-(--cf-red)! bg-(--cf-red)/10! border-(--cf-red)/40!"
                  onClick={() => removeFilter(filter.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              <input
                value={filter.valuesText}
                onChange={event =>
                  updateFilter(filter.id, {
                    valuesText: event.target.value
                  })
                }
                placeholder="Values separated by comma: PIR, Минвата, ППУ"
                className="mt-2 h-8 w-full rounded-md border border-[var(--cf-border)] bg-[var(--cf-element)] px-2 text-[11px] text-[var(--cf-text)] outline-none placeholder:text-[var(--cf-text-muted)]"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex justify-end">
        <Button
          type="button"
          variant="ghost"
          disabled={!canSave}
          className="h-8 rounded-md bg-[var(--cf-button)] px-3 text-[11px] text-[var(--cf-text)] disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => void save()}
        >
          {category ? 'Save category' : 'Create category'}
        </Button>
      </div>
    </section>
  )
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md border border-[var(--cf-border)] bg-[var(--cf-element)] p-3">
      <div className="text-[10px] uppercase tracking-wide text-[var(--cf-text-muted)]">
        {label}
      </div>

      <div className="mt-1 truncate text-[13px] font-semibold text-[var(--cf-text)]">
        {value}
      </div>
    </div>
  )
}