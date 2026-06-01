import type { CurrencyDisplayMode, MoneyPair } from "@/entities/crm/types"
import { formatNumber } from "./format-number"

export function formatMoneyPair(
  money: MoneyPair,
  displayMode: CurrencyDisplayMode
) {
  const rub = `${formatNumber(money.rub)} ₽`
  const uzs = `${formatNumber(money.uzs)} сум`

  if (displayMode === "rub_only") return rub
  if (displayMode === "uzs_only") return uzs

  return `${rub} / ${uzs}`
}