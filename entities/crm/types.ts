export type CurrencyCode = "RUB" | "UZS"

export type MoneyPair = {
  rub: number
  uzs: number
  rateId?: string
  convertedAt?: string
  displayMode?: "dual" | "rub_first" | "uzs_first"
}

export type CurrencyDisplayMode = "dual" | "rub_only" | "uzs_only"

export type ChannelType =
  | "website_chat"
  | "telegram"
  | "whatsapp"
  | "email"
  | "website_form"
  | "phone"
  | "manual"
  | "instagram"
  | "vk"
  | "avito"
  | "custom"

export type Permission =
  | "dashboard.view"
  | "analytics.sales"
  | "analytics.managers"
  | "analytics.clients"
  | "analytics.products"
  | "analytics.websites"
  | "analytics.bots"
  | "analytics.ai"
  | "analytics.losses"
  | "analytics.export"
  | "orders.view_losses"
  | "settings.currency_view"

export type DataScopeType = "own" | "team" | "department" | "all" | "custom"

export type DataScope = {
  type: DataScopeType
  userIds?: string[]
  managerIds?: string[]
  teamIds?: string[]
  departmentIds?: string[]
  websiteIds?: string[]
  botIds?: string[]
  channelTypes?: ChannelType[]
  productCategoryIds?: string[]
  regionIds?: string[]
}

export type CRMUser = {
  id: string
  fullName: string
  email: string
  roleNames: string[]
  permissions: Permission[]
  dataScope: DataScope
}