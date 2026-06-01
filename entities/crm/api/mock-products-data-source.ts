import type {
    CreateProductCategoryPayload,
  CreateProductPayload,
  CRMProduct,
  ProductCategory,
  ProductCategoryFilters,
  ProductCategoryStatus,
  ProductFilters,
  ProductImage,
  ProductStatus,
  UpdateProductCategoryPayload,
  UpdateProductPayload
} from '@/features/products/model/products-types'
import { initialProductFilters } from '@/features/products/model/products-types'
import type { MoneyPair } from '@/features/orders/model/orders-types'

const PRODUCTS_STORAGE_KEY = 'crm.mock.products'
const PRODUCT_CATEGORIES_STORAGE_KEY = 'crm.mock.product-categories'
const RUB_TO_UZS_RATE = 138
const RATE_ID = 'rate_2026_05_30'

function uid(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}_${crypto.randomUUID()}`
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

function createProductImage(url: string, index = 0): ProductImage {
  return {
    id: uid('product_image'),
    url,
    isSelect: index === 0
  }
}

function normalizeProductImages(
  images: Array<ProductImage | string> | undefined
): ProductImage[] {
  const normalizedImages = (images ?? [])
    .map((image, index) => {
      if (typeof image === 'string') {
        return createProductImage(image, index)
      }

      return {
        id: image.id || uid('product_image'),
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

function normalizeProduct(product: CRMProduct): CRMProduct {
  return {
    ...product,
    images: normalizeProductImages(
      product.images as Array<ProductImage | string>
    )
  }
}

function money(rub: number): MoneyPair {
  return {
    rub,
    uzs: Math.round(rub * RUB_TO_UZS_RATE),
    rateId: RATE_ID,
    convertedAt: '2026-05-30T00:00:00.000Z'
  }
}

function now() {
  return new Date().toLocaleString('ru-RU')
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

const seedCategories: ProductCategory[] = [
  {
    id: 'cat_panels',
    name: 'Сэндвич-панели',
    slug: 'sendvich-paneli',
    status: 'active',
    description: 'Стеновые, кровельные, арочные и специальные панели.',
    filters: [
      {
        id: 'pf_panel_type',
        key: 'panel_type',
        label: 'Тип панели',
        type: 'select',
        values: ['стеновая', 'кровельная', 'арочная', 'угловая']
      },
      {
        id: 'pf_insulation',
        key: 'insulation',
        label: 'Утеплитель',
        type: 'select',
        values: ['PIR', 'минвата', 'ППУ', 'ППС']
      },
      {
        id: 'pf_thickness',
        key: 'thickness',
        label: 'Толщина',
        type: 'range',
        unit: 'мм'
      }
    ],
    sortOrder: 1,
    createdAt: '2026-05-30 09:00',
    updatedAt: '2026-05-30 09:00'
  },
  {
    id: 'cat_panels_wall',
    name: 'Стеновые',
    slug: 'stenovye',
    parentId: 'cat_panels',
    status: 'active',
    description: 'Стеновые сэндвич-панели для фасадов, перегородок и зданий.',
    filters: [
      {
        id: 'pf_wall_panel_thickness',
        key: 'thickness',
        label: 'Толщина',
        type: 'range',
        unit: 'мм'
      },
      {
        id: 'pf_wall_panel_color',
        key: 'ral',
        label: 'RAL',
        type: 'text'
      }
    ],
    sortOrder: 2,
    createdAt: '2026-05-30 09:00',
    updatedAt: '2026-05-30 09:00'
  },
  {
    id: 'cat_panels_roof',
    name: 'Кровельные',
    slug: 'krovelnye',
    parentId: 'cat_panels',
    status: 'active',
    description: 'Кровельные панели для скатных и промышленных крыш.',
    filters: [
      {
        id: 'pf_roof_panel_thickness',
        key: 'thickness',
        label: 'Толщина',
        type: 'range',
        unit: 'мм'
      },
      {
        id: 'pf_roof_panel_lock',
        key: 'lock_type',
        label: 'Замок',
        type: 'select',
        values: ['стандартный', 'усиленный']
      }
    ],
    sortOrder: 3,
    createdAt: '2026-05-30 09:00',
    updatedAt: '2026-05-30 09:00'
  },
  {
    id: 'cat_profnastil',
    name: 'Профнастил',
    slug: 'profnastil',
    status: 'active',
    description: 'Профнастил для кровли, фасада, забора и несущих конструкций.',
    filters: [
      {
        id: 'pf_profile',
        key: 'profile',
        label: 'Профиль',
        type: 'select',
        values: ['С8', 'С20', 'НС35', 'Н60', 'Н75', 'Н114']
      },
      {
        id: 'pf_metal_thickness',
        key: 'metal_thickness',
        label: 'Толщина металла',
        type: 'range',
        unit: 'мм'
      },
      {
        id: 'pf_coating',
        key: 'coating',
        label: 'Покрытие',
        type: 'select',
        values: ['оцинкованный', 'полиэстер', 'PUR', 'Prisma']
      }
    ],
    sortOrder: 4,
    createdAt: '2026-05-30 09:00',
    updatedAt: '2026-05-30 09:00'
  },
  {
    id: 'cat_roof',
    name: 'Кровельные материалы',
    slug: 'krovelnye-materialy',
    status: 'active',
    description: 'Материалы для устройства кровли и комплектующих узлов.',
    filters: [
      {
        id: 'pf_roof_material',
        key: 'material_type',
        label: 'Тип материала',
        type: 'select',
        values: ['металлочерепица', 'фальц', 'доборы', 'водосток']
      }
    ],
    sortOrder: 5,
    createdAt: '2026-05-30 09:00',
    updatedAt: '2026-05-30 09:00'
  },
  {
    id: 'cat_accessories',
    name: 'Доборные элементы',
    slug: 'dobornye-elementy',
    status: 'active',
    description: 'Планки, коньки, примыкания, ендовы и другие элементы.',
    filters: [
      {
        id: 'pf_accessory_type',
        key: 'accessory_type',
        label: 'Тип добора',
        type: 'select',
        values: ['конёк', 'планка', 'ендова', 'капельник']
      },
      {
        id: 'pf_accessory_color',
        key: 'ral',
        label: 'RAL',
        type: 'text'
      }
    ],
    sortOrder: 6,
    createdAt: '2026-05-30 09:00',
    updatedAt: '2026-05-30 09:00'
  },
  {
    id: 'cat_fasteners',
    name: 'Крепёж',
    slug: 'krepezh',
    status: 'active',
    description: 'Саморезы, крепёжные элементы и расходные материалы.',
    filters: [
      {
        id: 'pf_fastener_size',
        key: 'size',
        label: 'Размер',
        type: 'text'
      },
      {
        id: 'pf_fastener_color',
        key: 'ral',
        label: 'RAL',
        type: 'text'
      }
    ],
    sortOrder: 7,
    createdAt: '2026-05-30 09:00',
    updatedAt: '2026-05-30 09:00'
  },
  {
    id: 'cat_sip',
    name: 'SIP-панели',
    slug: 'sip-paneli',
    status: 'active',
    description: 'SIP-панели для домокомплектов и быстровозводимых объектов.',
    filters: [
      {
        id: 'pf_sip_thickness',
        key: 'thickness',
        label: 'Толщина',
        type: 'range',
        unit: 'мм'
      }
    ],
    sortOrder: 8,
    createdAt: '2026-05-30 09:00',
    updatedAt: '2026-05-30 09:00'
  },
  {
    id: 'cat_lstk',
    name: 'ЛСТК',
    slug: 'lstk',
    status: 'active',
    description: 'Лёгкие стальные тонкостенные конструкции.',
    filters: [
      {
        id: 'pf_lstk_profile',
        key: 'profile_type',
        label: 'Тип профиля',
        type: 'select',
        values: ['C', 'U', 'Z', 'омега']
      }
    ],
    sortOrder: 9,
    createdAt: '2026-05-30 09:00',
    updatedAt: '2026-05-30 09:00'
  }
]

function normalizeCategory(category: ProductCategory): ProductCategory {
  return {
    ...category,
    status: category.status ?? 'active',
    filters: category.filters ?? [],
    sortOrder: category.sortOrder ?? 0
  }
}

function normalizeCategories(categories: ProductCategory[]) {
  return categories.map(normalizeCategory)
}

function applyProductCategoryFilters(
  categories: ProductCategory[],
  filters?: ProductCategoryFilters
) {
  if (!filters) return categories

  return categories.filter(category => {
    const search = filters.search.trim().toLowerCase()

    if (search) {
      const haystack = [
        category.name,
        category.slug,
        category.description,
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

function replaceProductCategory(updatedCategory: ProductCategory) {
  productCategories = productCategories.map(category =>
    category.id === updatedCategory.id ? updatedCategory : category
  )

  saveToStorage(PRODUCT_CATEGORIES_STORAGE_KEY, productCategories)

  return updatedCategory
}

const productNames = [
  'Стеновая PIR панель 100 мм RAL 9003',
  'Кровельная PIR панель 120 мм RAL 7004',
  'Сэндвич-панель МВ 150 мм RAL 7024',
  'Профнастил НС35 0.5 RAL 6005',
  'Профнастил С8 0.45 RAL 8017',
  'Профнастил Н60 0.7 оцинкованный',
  'Металлочерепица Монтеррей 0.5 RAL 3005',
  'Металлочерепица Камея 0.5 RAL 7024',
  'Планка примыкания RAL 9003',
  'Конёк кровельный фигурный RAL 8017',
  'Саморез кровельный 4.8x35 RAL 6005',
  'ЛСТК профиль C-150 оцинкованный'
]

function createSeedProduct(index: number): CRMProduct {
  const category = seedCategories[index % seedCategories.length]
  const name = productNames[index % productNames.length]
  const priceRub = 520 + index * 47
  const hasCost = index % 4 !== 0

  return {
    id: `product_${String(index + 1).padStart(3, '0')}`,
    sku: `SKU-${String(index + 1).padStart(4, '0')}`,
    name,
    categoryId: category.id,
    categoryName: category.name,
    status:
      index % 17 === 0 ? 'out_of_stock' : index % 11 === 0 ? 'draft' : 'active',
    unit:
      category.id === 'cat_fasteners'
        ? 'pcs'
        : category.id === 'cat_lstk'
          ? 'm'
          : 'm2',
    price: money(priceRub),
    costPrice: hasCost ? money(Math.round(priceRub * 0.72)) : undefined,
    stockMode:
      index % 5 === 0
        ? 'preorder'
        : index % 3 === 0
          ? 'production'
          : index % 2 === 0
            ? 'mixed'
            : 'stock',
    stockQty: index % 3 === 0 ? 0 : 20 + index * 3,
    productionLeadTimeDays: 1 + (index % 5),
    deliveryLeadTimeDays: 2 + (index % 6),
    characteristics: [
      {
        id: `pch_${index}_1`,
        name: 'Материал',
        value:
          category.id === 'cat_profnastil'
            ? 'оцинкованная сталь'
            : category.name
      },
      {
        id: `pch_${index}_2`,
        name: 'Покрытие',
        value: index % 2 === 0 ? 'полиэстер' : 'оцинковка'
      }
    ],
    images:
      index % 4 === 0
        ? []
        : [
            {
              id: `product_image_${index}_1`,
              url: 'https://placehold.co/640x420',
              isSelect: true
            },
            {
              id: `product_image_${index}_2`,
              url: 'https://placehold.co/640x420?text=Product',
              isSelect: false
            }
          ],
    description:
      'Товар для расчёта коммерческих предложений, сделок и заказов в CRM.',
    managerNote:
      index % 6 === 0
        ? 'Проверять сроки производства перед выставлением счёта.'
        : undefined,
    createdAt: '2026-05-30 09:00',
    updatedAt: '2026-05-30 09:00'
  }
}

const seedProducts: CRMProduct[] = Array.from({ length: 120 }, (_, index) =>
  createSeedProduct(index)
)

function readFromStorage<T>(key: string, seed: T) {
  if (typeof window === 'undefined') return seed

  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return seed

    return JSON.parse(raw) as T
  } catch {
    return seed
  }
}

function saveToStorage<T>(key: string, value: T) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      throw new Error(
        'LocalStorage quota exceeded. Удали старые mock-products или используй изображения меньшего размера.'
      )
    }

    throw error
  }
}

let products: CRMProduct[] = readFromStorage(
  PRODUCTS_STORAGE_KEY,
  seedProducts
).map(normalizeProduct)

let productCategories: ProductCategory[] = normalizeCategories(
  readFromStorage(PRODUCT_CATEGORIES_STORAGE_KEY, seedCategories)
)

function applyProductFilters(items: CRMProduct[], filters: ProductFilters) {
  return items.filter(product => {
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

function getCategoryOrThrow(categoryId: string) {
  const category = productCategories.find(item => item.id === categoryId)

  if (!category) {
    throw new Error('Product category not found')
  }

  return category
}

function replaceProduct(updatedProduct: CRMProduct) {
  products = products.map(product =>
    product.id === updatedProduct.id ? updatedProduct : product
  )

  saveToStorage(PRODUCTS_STORAGE_KEY, products)

  return updatedProduct
}

export const mockProductsDataSource = {
  async getProducts(filters: ProductFilters = initialProductFilters) {
    await new Promise(resolve => setTimeout(resolve, 140))

    return applyProductFilters(products, filters)
  },

  async getProductCategories(filters?: ProductCategoryFilters) {
    await new Promise(resolve => setTimeout(resolve, 80))

    return applyProductCategoryFilters(
      [...productCategories].sort((a, b) => a.sortOrder - b.sortOrder),
      filters
    )
  },

  async createProductCategory(payload: CreateProductCategoryPayload) {
    const createdAt = now()
    const slug = payload.slug.trim() || slugify(payload.name)

    const category: ProductCategory = {
      id: uid('cat'),
      name: payload.name.trim(),
      slug,
      status: payload.status,
      filters: payload.filters,
      sortOrder:
        payload.sortOrder ??
        Math.max(0, ...productCategories.map(item => item.sortOrder)) + 1,
      createdAt,
      updatedAt: createdAt,
      ...(payload.parentId ? { parentId: payload.parentId } : {}),
      ...(payload.description?.trim()
        ? { description: payload.description.trim() }
        : {})
    }

    productCategories = [category, ...productCategories]
    saveToStorage(PRODUCT_CATEGORIES_STORAGE_KEY, productCategories)

    return category
  },

  async updateProductCategory(
    categoryId: string,
    payload: UpdateProductCategoryPayload
  ) {
    const category = productCategories.find(item => item.id === categoryId)

    if (!category) {
      throw new Error('Product category not found')
    }

    if (payload.parentId === categoryId) {
      throw new Error('Category cannot be parent of itself')
    }

    const updatedCategory: ProductCategory = {
      ...category,
      ...payload,
      name: payload.name?.trim() ?? category.name,
      slug:
        payload.slug !== undefined
          ? payload.slug.trim() || slugify(payload.name ?? category.name)
          : category.slug,
      filters: payload.filters ?? category.filters,
      updatedAt: now(),
      ...(payload.parentId !== undefined
        ? payload.parentId
          ? { parentId: payload.parentId }
          : { parentId: undefined }
        : {})
    }

    return replaceProductCategory(normalizeCategory(updatedCategory))
  },

  async updateProductCategoryStatus(
    categoryId: string,
    status: ProductCategoryStatus
  ) {
    const category = productCategories.find(item => item.id === categoryId)

    if (!category) {
      throw new Error('Product category not found')
    }

    return replaceProductCategory({
      ...category,
      status,
      updatedAt: now()
    })
  },

  async duplicateProductCategory(categoryId: string) {
    const category = productCategories.find(item => item.id === categoryId)

    if (!category) {
      throw new Error('Product category not found')
    }

    const createdAt = now()

    const duplicatedCategory: ProductCategory = {
      ...category,
      id: uid('cat'),
      name: `${category.name} copy`,
      slug: `${category.slug}-copy`,
      status: 'archived',
      sortOrder:
        Math.max(0, ...productCategories.map(item => item.sortOrder)) + 1,
      createdAt,
      updatedAt: createdAt,
      filters: category.filters.map(filter => ({
        ...filter,
        id: uid('filter')
      }))
    }

    productCategories = [duplicatedCategory, ...productCategories]
    saveToStorage(PRODUCT_CATEGORIES_STORAGE_KEY, productCategories)

    return duplicatedCategory
  },

  async deleteProductCategory(categoryId: string) {
    const hasProducts = products.some(
      product => product.categoryId === categoryId
    )

    if (hasProducts) {
      throw new Error(
        'Category has products. Move products to another category or archive this category.'
      )
    }

    productCategories = productCategories.filter(
      category => category.id !== categoryId
    )

    saveToStorage(PRODUCT_CATEGORIES_STORAGE_KEY, productCategories)
  },

  async createProduct(payload: CreateProductPayload) {
    const category = getCategoryOrThrow(payload.categoryId)
    const createdAt = now()

    const product: CRMProduct = {
      id: uid('product'),
      sku: payload.sku,
      name: payload.name,
      categoryId: category.id,
      categoryName: category.name,
      status: payload.status,
      unit: payload.unit,
      price: payload.price,
      costPrice: payload.costPrice,
      stockMode: payload.stockMode,
      stockQty: payload.stockQty,
      productionLeadTimeDays: payload.productionLeadTimeDays,
      deliveryLeadTimeDays: payload.deliveryLeadTimeDays,
      characteristics: payload.characteristics,
      images: normalizeProductImages(payload.images),
      description: payload.description,
      managerNote: payload.managerNote,
      createdAt,
      updatedAt: createdAt
    }

    products = [product, ...products]
    saveToStorage(PRODUCTS_STORAGE_KEY, products)

    return product
  },

  async updateProduct(productId: string, payload: UpdateProductPayload) {
    const product = products.find(item => item.id === productId)

    if (!product) {
      throw new Error('Product not found')
    }

    const category = payload.categoryId
      ? getCategoryOrThrow(payload.categoryId)
      : undefined

    const updatedProduct = normalizeProduct({
      ...product,
      ...payload,
      categoryId: category?.id ?? product.categoryId,
      categoryName: category?.name ?? product.categoryName,
      updatedAt: now()
    })

    return replaceProduct(updatedProduct)
  },

  async updateProductStatus(productId: string, status: ProductStatus) {
    const product = products.find(item => item.id === productId)

    if (!product) {
      throw new Error('Product not found')
    }

    return replaceProduct({
      ...product,
      status,
      updatedAt: now()
    })
  },

  async duplicateProduct(productId: string) {
    const product = products.find(item => item.id === productId)

    if (!product) {
      throw new Error('Product not found')
    }

    const duplicated: CRMProduct = {
      ...product,
      id: uid('product'),
      sku: `${product.sku}-COPY`,
      name: `${product.name} copy`,
      status: 'draft',
      createdAt: now(),
      updatedAt: now()
    }

    products = [duplicated, ...products]
    saveToStorage(PRODUCTS_STORAGE_KEY, products)

    return duplicated
  },

  async deleteProduct(productId: string) {
    products = products.filter(product => product.id !== productId)
    saveToStorage(PRODUCTS_STORAGE_KEY, products)
  },

  resetProductsStorage() {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(PRODUCTS_STORAGE_KEY)
      window.localStorage.removeItem(PRODUCT_CATEGORIES_STORAGE_KEY)
    }

    products = seedProducts
    productCategories = seedCategories

    saveToStorage(PRODUCTS_STORAGE_KEY, products)
    saveToStorage(PRODUCT_CATEGORIES_STORAGE_KEY, productCategories)

    return products
  }
}
