"use client"

import { Check } from "lucide-react"
import { cn } from "@/shared/lib/cn"

type SelectCheckboxProps = {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label?: string
}

export function SelectCheckbox({
  checked,
  onCheckedChange,
  label,
}: SelectCheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label ?? "Select client"}
      onClick={(event) => {
        event.stopPropagation()
        onCheckedChange(!checked)
      }}
      className={cn(
        "flex h-6 w-6 items-center justify-center rounded-[8px] border transition cursor-pointer",
        checked
          ? " bg-[rgba(255,255,255,0.08)] text-(--cf-green) border-(--cf-table-text)/40"
          : "border-(--cf-table-text)/40 bg-(--cf-element) text-transparent hover:border-(--cf-table-text)"
      )}
    >
      <Check className="h-4 w-4 stroke-[2.5]" />
    </button>
  )
}