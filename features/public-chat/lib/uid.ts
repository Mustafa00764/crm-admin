export function uid() {
  return `msg_${Date.now()}_${Math.random().toString(16).slice(2)}`
}
