export function formatNumber(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value)
}