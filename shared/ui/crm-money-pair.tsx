import type { CurrencyDisplayMode, MoneyPair } from "@/entities/crm/types"
import { formatNumber } from "@/shared/lib/format-number"

type CrmMoneyPairProps = {
  value: MoneyPair
  displayMode: CurrencyDisplayMode
}

export function CrmMoneyPair({ value, displayMode }: CrmMoneyPairProps) {
  if (displayMode === "rub_only") {
    return <span>{formatNumber(value.rub)} ₽</span>
  }

  if (displayMode === "uzs_only") {
    return <span>{formatNumber(value.uzs)} сум</span>
  }

  return (
    <span className="flex flex-col leading-tight">
      <span>{formatNumber(value.rub)} ₽</span>
      <span className="text-[10px] ">
        {formatNumber(value.uzs)} сум
      </span>
    </span>
  )
}