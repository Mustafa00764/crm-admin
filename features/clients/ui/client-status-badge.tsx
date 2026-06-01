import type { ClientStatus } from '../model/clients-types'

export function ClientStatusBadge({ status }: { status: ClientStatus }) {
  const className = getStatusClass(status)

  return (
    <span className={`rounded px-2 py-1 text-[10px] font-medium ${className}`}>
      {status}
    </span>
  )
}

function getStatusClass(status: ClientStatus) {
  if (status === 'spam' || status === 'lost') {
    return 'bg-[var(--cf-red)] text-white'
  }

  if (status === 'waiting_payment' || status === 'calculation') {
    return 'bg-[var(--cf-yellow)] text-black'
  }

  if (status === 'customer' || status === 'repeat_customer') {
    return 'bg-[var(--cf-green)] text-black'
  }

  if (status === 'ai_active' || status === 'manager_active') {
    return 'bg-[var(--cf-blue)] text-black'
  }

  return 'bg-[var(--cf-button)] text-[var(--cf-text)]'
}
