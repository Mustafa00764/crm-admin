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
import { ProductsFilters } from './products-filters'
import { ProductsTable } from './products-table'
import { ProductsCardGrid } from './products-card-grid'
import { ProductDetailsDrawer } from './product-details-drawer'
import type { CRMProduct, ProductFilters } from '../model/products-types'
import { ListPagination } from '@/shared/ui/list-pagination'
import { usePaginatedList } from '@/shared/hooks/use-paginated-list'

export function ProductsPage() {
  const {
    products,
    productCategories,
    selectedProductId,
    productsFilters,
    productsLoading,
    productsError,
    loadProducts,
    selectProduct,
    deleteProduct
  } = useCRMStore()

  const [viewMode, setViewMode] = usePersistedViewMode(
    'crm.products.viewMode',
    'table'
  )
  const [selectedProductIds, setSelectedProductIds] = React.useState<string[]>(
    []
  )
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)

  React.useEffect(() => {
    void loadProducts()
  }, [loadProducts])

  const filteredProducts = React.useMemo(() => {
    return applyProductFilters(products, productsFilters)
  }, [products, productsFilters])

  const {
    page,
    pageSize,
    total,
    totalPages,
    paginatedItems: paginatedProducts,
    setPage,
    setPageSize
  } = usePaginatedList({
    items: filteredProducts,
    storageKey: 'crm.products.pageSize',
    defaultPageSize: 20
  })

  const selectedProduct = React.useMemo(() => {
    return products.find(product => product.id === selectedProductId) ?? null
  }, [products, selectedProductId])

  const selectedFilteredProductIds = React.useMemo(() => {
    return selectedProductIds.filter(productId =>
      filteredProducts.some(product => product.id === productId)
    )
  }, [selectedProductIds, filteredProducts])

  const openProduct = React.useCallback(
    (productId: string) => {
      selectProduct(productId)
      setIsDrawerOpen(true)
    },
    [selectProduct]
  )

  const openCreateProduct = React.useCallback(() => {
    selectProduct(null)
    setIsDrawerOpen(true)
  }, [selectProduct])

  const toggleProduct = React.useCallback((productId: string) => {
    setSelectedProductIds(current =>
      current.includes(productId)
        ? current.filter(id => id !== productId)
        : [...current, productId]
    )
  }, [])

  const toggleAll = React.useCallback(() => {
    setSelectedProductIds(current => {
      const visibleIds = paginatedProducts.map(product => product.id)

      if (visibleIds.length === 0) return current

      const allSelected = visibleIds.every(id => current.includes(id))

      if (allSelected) {
        return current.filter(id => !visibleIds.includes(id))
      }

      return Array.from(new Set([...current, ...visibleIds]))
    })
  }, [paginatedProducts])

  const deleteSelected = React.useCallback(async () => {
    await Promise.all(
      selectedProductIds.map(productId => deleteProduct(productId))
    )
    setSelectedProductIds([])
  }, [selectedProductIds, deleteProduct])

  return (
    <div className="cf-page min-h-screen">
      <AdminPageHeader
        title="Dashboard - Products"
        actions={
          <>
            <ThemeToggle />

            <Button
              type="button"
              variant="ghost"
              className="cf-icon-button"
              disabled={productsLoading}
              onClick={() => void loadProducts()}
            >
              <RefreshCw
                className={productsLoading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'}
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
              onClick={openCreateProduct}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </>
        }
      />

      <div className="h-full px-5 py-3">
        <main className="flex min-w-0 flex-col gap-3">
          <ProductsFilters />

          {selectedFilteredProductIds.length > 0 ? (
            <div className="cf-panel flex items-center justify-between gap-3 px-3 py-2">
              <div className="text-[12px] text-[var(--cf-text)]">
                Выбрано товаров:{' '}
                <span className="font-semibold">
                  {selectedFilteredProductIds.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8 rounded-md bg-[var(--cf-button)] px-3 text-[11px] text-[var(--cf-text)] hover:bg-[var(--cf-element-hover)]"
                  onClick={() => setSelectedProductIds([])}
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
                  Удалить выбранные
                </Button>
              </div>
            </div>
          ) : null}

          {productsError ? (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-[12px] text-red-400">
              {productsError}
            </div>
          ) : null}

          {productsLoading ? (
            <section className="cf-panel flex min-h-[320px] items-center justify-center text-[12px] text-[var(--cf-text-muted)]">
              Loading products...
            </section>
          ) : (
            <>
              {viewMode === 'table' ? (
                <ProductsTable
                  products={paginatedProducts}
                  selectedProductId={selectedProductId}
                  selectedProductIds={selectedFilteredProductIds}
                  onSelect={openProduct}
                  onToggleProduct={toggleProduct}
                  onToggleAll={toggleAll}
                />
              ) : (
                <ProductsCardGrid
                  products={paginatedProducts}
                  selectedProductIds={selectedFilteredProductIds}
                  onSelect={openProduct}
                  onToggleProduct={toggleProduct}
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

      <ProductDetailsDrawer
        open={isDrawerOpen}
        product={selectedProduct}
        categories={productCategories}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  )
}

function applyProductFilters(products: CRMProduct[], filters: ProductFilters) {
  return products.filter(product => {
    const search = filters.search.trim().toLowerCase()

    if (search) {
      const haystack = [
        product.sku,
        product.name,
        product.categoryName,
        product.status,
        product.stockMode,
        product.managerNote,
        product.description
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      if (!haystack.includes(search)) return false
    }

    if (filters.status !== 'all' && product.status !== filters.status) {
      return false
    }

    if (
      filters.categoryId !== 'all' &&
      product.categoryId !== filters.categoryId
    ) {
      return false
    }

    if (
      filters.stockMode !== 'all' &&
      product.stockMode !== filters.stockMode
    ) {
      return false
    }

    if (filters.unit !== 'all' && product.unit !== filters.unit) {
      return false
    }

    if (filters.hasCostPrice === 'yes' && !product.costPrice) return false
    if (filters.hasCostPrice === 'no' && product.costPrice) return false

    if (filters.hasImages === 'yes' && product.images.length === 0) return false
    if (filters.hasImages === 'no' && product.images.length > 0) return false

    const priceFrom = Number(filters.priceFrom)
    const priceTo = Number(filters.priceTo)

    if (
      filters.priceFrom &&
      !Number.isNaN(priceFrom) &&
      product.price.rub < priceFrom
    ) {
      return false
    }

    if (
      filters.priceTo &&
      !Number.isNaN(priceTo) &&
      product.price.rub > priceTo
    ) {
      return false
    }

    return true
  })
}
