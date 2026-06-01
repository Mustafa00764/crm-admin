'use client'

import * as React from 'react'
import {
  Download,
  LayoutGrid,
  List,
  Plus,
  RefreshCw,
  Trash2,
  X
} from 'lucide-react'
import { AdminPageHeader } from '@/widgets/admin-shell/ui/admin-page-header'
import { ThemeToggle } from '@/shared/ui/theme-toggle'
import { Button } from '@/shared/ui/button'
import { useCRMStore } from '@/entities/crm/model/crm-store'
import { usePersistedViewMode } from '@/shared/hooks/use-persisted-view-mode'
import type {
  ProductCategory,
  ProductCategoryFilters
} from '@/features/products/model/products-types'
import { ProductCategoriesFilters } from './product-categories-filters'
import { ProductCategoriesTable } from './product-categories-table'
import { ProductCategoriesCardGrid } from './product-categories-card-grid'
import { ProductCategoryDetailsDrawer } from './product-category-details-drawer'
import { ListPagination } from '@/shared/ui/list-pagination'
import { usePaginatedList } from '@/shared/hooks/use-paginated-list'

export function ProductCategoriesPage() {
  const {
    products,
    productCategories,
    selectedProductCategoryId,
    productCategoryFilters,
    productCategoriesLoading,
    productCategoriesError,
    loadProducts,
    loadProductCategories,
    selectProductCategory,
    deleteProductCategory
  } = useCRMStore()

  const [viewMode, setViewMode] = usePersistedViewMode(
    'crm.productCategories.viewMode',
    'cards'
  )
  const [selectedCategoryIds, setSelectedCategoryIds] = React.useState<
    string[]
  >([])
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)

  React.useEffect(() => {
    void loadProducts()
    void loadProductCategories()
  }, [loadProducts, loadProductCategories])

  const productCountByCategoryId = React.useMemo(() => {
    return products.reduce<Record<string, number>>((acc, product) => {
      acc[product.categoryId] = (acc[product.categoryId] ?? 0) + 1
      return acc
    }, {})
  }, [products])

  const filteredCategories = React.useMemo(() => {
    return applyCategoryFilters(productCategories, productCategoryFilters)
  }, [productCategories, productCategoryFilters])

  const {
    page,
    pageSize,
    total,
    totalPages,
    paginatedItems: paginatedProducts,
    setPage,
    setPageSize
  } = usePaginatedList({
    items: filteredCategories,
    storageKey: 'crm.products.pageSize',
    defaultPageSize: 20
  })

  const selectedCategory = React.useMemo(() => {
    return (
      productCategories.find(
        category => category.id === selectedProductCategoryId
      ) ?? null
    )
  }, [productCategories, selectedProductCategoryId])

  const selectedFilteredCategoryIds = React.useMemo(() => {
    return selectedCategoryIds.filter(categoryId =>
      filteredCategories.some(category => category.id === categoryId)
    )
  }, [selectedCategoryIds, filteredCategories])

  const openCategory = React.useCallback(
    (categoryId: string) => {
      selectProductCategory(categoryId)
      setIsDrawerOpen(true)
    },
    [selectProductCategory]
  )

  const openCreateCategory = React.useCallback(() => {
    selectProductCategory(null)
    setIsDrawerOpen(true)
  }, [selectProductCategory])

  const toggleCategory = React.useCallback((categoryId: string) => {
    setSelectedCategoryIds(current =>
      current.includes(categoryId)
        ? current.filter(id => id !== categoryId)
        : [...current, categoryId]
    )
  }, [])

  const toggleAll = React.useCallback(() => {
    setSelectedCategoryIds(current => {
      const filteredIds = filteredCategories.map(category => category.id)

      if (filteredIds.length === 0) return []

      const allSelected = filteredIds.every(id => current.includes(id))

      if (allSelected) {
        return current.filter(id => !filteredIds.includes(id))
      }

      return Array.from(new Set([...current, ...filteredIds]))
    })
  }, [filteredCategories])

  const deleteSelected = React.useCallback(async () => {
    const deletableIds = selectedCategoryIds.filter(
      categoryId => (productCountByCategoryId[categoryId] ?? 0) === 0
    )

    await Promise.all(
      deletableIds.map(categoryId => deleteProductCategory(categoryId))
    )

    setSelectedCategoryIds([])
  }, [selectedCategoryIds, productCountByCategoryId, deleteProductCategory])

  const safePage = Math.min(page, totalPages)

  const paginatedCategories = React.useMemo(() => {
    const start = (safePage - 1) * pageSize
    const end = start + pageSize

    return filteredCategories.slice(start, end)
  }, [filteredCategories, safePage, pageSize])

  return (
    <div className="cf-page flex flex-col min-h-screen">
      <AdminPageHeader
        title="Dashboard - Product Categories"
        actions={
          <>
            <ThemeToggle />

            <Button
              type="button"
              variant="ghost"
              className="cf-icon-button"
              disabled={productCategoriesLoading}
              onClick={() => void loadProductCategories()}
            >
              <RefreshCw
                className={
                  productCategoriesLoading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'
                }
              />
            </Button>

            <Button type="button" variant="ghost" className="cf-icon-button">
              <Download className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              className={
                viewMode === 'table'
                  ? 'cf-icon-button bg-[var(--cf-button)] text-[var(--cf-text)]'
                  : 'cf-icon-button'
              }
              onClick={() => setViewMode('table')}
            >
              <List className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              className={
                viewMode === 'cards'
                  ? 'cf-icon-button bg-[var(--cf-button)] text-[var(--cf-text)]'
                  : 'cf-icon-button'
              }
              onClick={() => setViewMode('cards')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="cf-icon-button"
              onClick={openCreateCategory}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </>
        }
      />

      <div className="h-full flex-1 flex flex-col px-5 py-3">
        <main className="h-full flex min-w-0 flex-col flex-1 gap-3">
          <ProductCategoriesFilters />

          {selectedFilteredCategoryIds.length > 0 ? (
            <div className="cf-panel flex items-center justify-between gap-3 px-3 py-2">
              <div className="text-[12px] text-[var(--cf-text)]">
                Выбрано категорий:{' '}
                <span className="font-semibold">
                  {selectedFilteredCategoryIds.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8 rounded-md bg-[var(--cf-button)] px-3 text-[11px] text-[var(--cf-text)] hover:bg-[var(--cf-element-hover)]"
                  onClick={() => setSelectedCategoryIds([])}
                >
                  <X className="mr-1 h-3.5 w-3.5" />
                  Снять выбор
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="h-8 rounded-md bg-[rgba(239,23,72,0.16)] px-3 text-[11px] text-[var(--cf-red)] hover:bg-[rgba(239,23,72,0.22)]"
                  onClick={() => void deleteSelected()}
                >
                  <Trash2 className="mr-1 h-3.5 w-3.5" />
                  Удалить без товаров
                </Button>
              </div>
            </div>
          ) : null}

          {productCategoriesError ? (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-[12px] text-red-400">
              {productCategoriesError}
            </div>
          ) : null}

          {productCategoriesLoading ? (
            <section className="cf-panel flex min-h-[320px] items-center justify-center text-[12px] text-[var(--cf-text-muted)]">
              Loading product categories...
            </section>
          ) : (
            <>
              {viewMode === 'table' ? (
                <ProductCategoriesTable
                  categories={paginatedCategories}
                  selectedCategoryId={selectedProductCategoryId}
                  selectedCategoryIds={selectedFilteredCategoryIds}
                  productCountByCategoryId={productCountByCategoryId}
                  onSelect={openCategory}
                  onToggleCategory={toggleCategory}
                  onToggleAll={toggleAll}
                />
              ) : (
                <ProductCategoriesCardGrid
                  categories={paginatedCategories}
                  selectedCategoryIds={selectedFilteredCategoryIds}
                  productCountByCategoryId={productCountByCategoryId}
                  onSelect={openCategory}
                  onToggleCategory={toggleCategory}
                />
              )}

              <ListPagination
                page={page}
                pageSize={pageSize}
                total={total}
                totalPages={totalPages}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            </>
          )}
        </main>
      </div>

      <ProductCategoryDetailsDrawer
        open={isDrawerOpen}
        category={selectedCategory}
        categories={productCategories}
        productCount={
          selectedCategory
            ? (productCountByCategoryId[selectedCategory.id] ?? 0)
            : 0
        }
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  )
}

function applyCategoryFilters(
  categories: ProductCategory[],
  filters: ProductCategoryFilters
) {
  return categories.filter(category => {
    const search = filters.search.trim().toLowerCase()

    if (search) {
      const haystack = [
        category.name,
        category.slug,
        category.description,
        category.status,
        category.filters
          .map(filter => `${filter.key} ${filter.label}`)
          .join(' ')
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      if (!haystack.includes(search)) return false
    }

    if (filters.status !== 'all' && category.status !== filters.status) {
      return false
    }

    if (filters.parentId !== 'all') {
      if (filters.parentId === 'root' && category.parentId) return false

      if (
        filters.parentId !== 'root' &&
        category.parentId !== filters.parentId
      ) {
        return false
      }
    }

    if (filters.hasFilters === 'yes' && category.filters.length === 0) {
      return false
    }

    if (filters.hasFilters === 'no' && category.filters.length > 0) {
      return false
    }

    return true
  })
}
