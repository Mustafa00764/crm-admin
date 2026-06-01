import type { MoneyPair } from '@/features/orders/model/orders-types'

export type ProductStatus = 'active' | 'draft' | 'archived' | 'out_of_stock'

export type ProductStockMode = 'stock' | 'production' | 'mixed' | 'preorder'

export type ProductUnit = 'pcs' | 'm2' | 'm' | 'kg' | 'ton' | 'set'

export type ProductViewMode = 'table' | 'cards'

export type ProductCharacteristic = {
  id: string
  name: string
  value: string
}

export type ProductImage = {
  id: string
  url: string
  isSelect: boolean
}

export type CRMProduct = {
  id: string
  sku: string
  name: string
  categoryId: string
  categoryName: string
  status: ProductStatus
  unit: ProductUnit
  price: MoneyPair
  costPrice?: MoneyPair
  stockMode: ProductStockMode
  stockQty?: number
  productionLeadTimeDays: number
  deliveryLeadTimeDays: number
  characteristics: ProductCharacteristic[]
  images: ProductImage[]
  description?: string
  managerNote?: string
  createdAt: string
  updatedAt: string
}

export type ProductFilters = {
  search: string
  status: ProductStatus | 'all'
  categoryId: string
  stockMode: ProductStockMode | 'all'
  unit: ProductUnit | 'all'
  hasCostPrice: 'all' | 'yes' | 'no'
  hasImages: 'all' | 'yes' | 'no'
  priceFrom: string
  priceTo: string
}

export type CreateProductPayload = {
  sku: string
  name: string
  categoryId: string
  status: ProductStatus
  unit: ProductUnit
  price: MoneyPair
  costPrice?: MoneyPair
  stockMode: ProductStockMode
  stockQty?: number
  productionLeadTimeDays: number
  deliveryLeadTimeDays: number
  characteristics: ProductCharacteristic[]
  images: ProductImage[]
  description?: string
  managerNote?: string
}

export type UpdateProductPayload = Partial<CreateProductPayload>

export const productStatuses: Array<{
  value: ProductStatus
  label: string
}> = [
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
  { value: 'out_of_stock', label: 'Out of stock' }
]

export const productStockModes: Array<{
  value: ProductStockMode
  label: string
}> = [
  { value: 'stock', label: 'Stock' },
  { value: 'production', label: 'Production' },
  { value: 'mixed', label: 'Mixed' },
  { value: 'preorder', label: 'Preorder' }
]

export const productUnits: Array<{
  value: ProductUnit
  label: string
}> = [
  { value: 'pcs', label: 'pcs' },
  { value: 'm2', label: 'm²' },
  { value: 'm', label: 'm' },
  { value: 'kg', label: 'kg' },
  { value: 'ton', label: 'ton' },
  { value: 'set', label: 'set' }
]

export const initialProductFilters: ProductFilters = {
  search: '',
  status: 'all',
  categoryId: 'all',
  stockMode: 'all',
  unit: 'all',
  hasCostPrice: 'all',
  hasImages: 'all',
  priceFrom: '',
  priceTo: ''
}

export type ProductCategoryStatus = 'active' | 'archived'

export type ProductFilterType =
  | 'text'
  | 'number'
  | 'select'
  | 'multi_select'
  | 'range'
  | 'boolean'

export type ProductFilter = {
  id: string
  key: string
  label: string
  type: ProductFilterType
  values?: string[]
  unit?: string
}

export type ProductCategory = {
  id: string
  name: string
  slug: string
  parentId?: string
  status: ProductCategoryStatus
  description?: string
  filters: ProductFilter[]
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export type ProductCategoryFilters = {
  search: string
  status: ProductCategoryStatus | 'all'
  parentId: string
  hasFilters: 'all' | 'yes' | 'no'
}

export type CreateProductCategoryPayload = {
  name: string
  slug: string
  parentId?: string
  status: ProductCategoryStatus
  description?: string
  filters: ProductFilter[]
  sortOrder?: number
}

export type UpdateProductCategoryPayload = Partial<CreateProductCategoryPayload>

export const productCategoryStatuses: Array<{
  value: ProductCategoryStatus
  label: string
}> = [
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' }
]

export const productFilterTypes: Array<{
  value: ProductFilterType
  label: string
}> = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'select', label: 'Select' },
  { value: 'multi_select', label: 'Multi select' },
  { value: 'range', label: 'Range' },
  { value: 'boolean', label: 'Boolean' }
]

export const initialProductCategoryFilters: ProductCategoryFilters = {
  search: '',
  status: 'all',
  parentId: 'all',
  hasFilters: 'all'
}
