'use client'

import type { CRMClient } from '../model/clients-types'
import { cn } from '@/shared/lib/cn'
import { CrmMoneyPair } from '@/shared/ui/crm-money-pair'
import { ClientStatusBadge } from './client-status-badge'
import { SelectCheckbox } from '@/shared/ui/select-checkbox'
import { ClientRowActionsMenu } from './client-row-actions-menu'

type ClientsTableProps = {
  clients: CRMClient[]
  selectedClientId: string | null
  selectedClientIds: string[]
  onSelect: (clientId: string) => void
  onToggleClient: (clientId: string) => void
  onToggleAll: () => void
}

export function ClientsTable({
  clients,
  selectedClientId,
  selectedClientIds,
  onSelect,
  onToggleClient,
  onToggleAll
}: ClientsTableProps) {
  const allSelected =
    clients.length > 0 &&
    clients.every(client => selectedClientIds.includes(client.id))

  return (
    <section className="cf-panel flex-1 min-h-0 overflow-hidden">
      <div className="clients-table-scroll h-full">
        <table className="clients-table">
          <thead>
            <tr>
              <th className="clients-table-head-cell clients-sticky-left-check">
                <SelectCheckbox
                  checked={allSelected}
                  onCheckedChange={onToggleAll}
                  label="Select all clients"
                />
              </th>

              <th className="clients-table-head-cell clients-sticky-left-number">
                #
              </th>

              <th className="clients-table-head-cell min-w-[210px]">client</th>
              <th className="clients-table-head-cell min-w-[170px]">company</th>
              <th className="clients-table-head-cell min-w-[150px]">phone</th>
              <th className="clients-table-head-cell min-w-[190px]">email</th>
              <th className="clients-table-head-cell min-w-[125px]">channel</th>
              <th className="clients-table-head-cell min-w-[140px]">source</th>
              <th className="clients-table-head-cell min-w-[190px]">website</th>
              <th className="clients-table-head-cell min-w-[170px]">bot</th>
              <th className="clients-table-head-cell min-w-[170px]">manager</th>
              <th className="clients-table-head-cell min-w-[150px]">status</th>
              <th className="clients-table-head-cell min-w-[160px]">orders</th>
              <th className="clients-table-head-cell min-w-[160px]">debt</th>
              <th className="clients-table-head-cell min-w-[160px]">
                last contact
              </th>

              <th className="clients-table-head-cell clients-sticky-right-options">
                options
              </th>
            </tr>
          </thead>

          <tbody>
            {clients.map((client, index) => {
              const checked = selectedClientIds.includes(client.id)

              return (
                <tr
                  key={client.id}
                  onClick={() => onSelect(client.id)}
                  className={cn(
                    'clients-table-row cursor-pointer',
                    selectedClientId === client.id && 'is-selected'
                  )}
                >
                  <td className="clients-table-cell clients-sticky-left-check">
                    <SelectCheckbox
                      checked={checked}
                      onCheckedChange={() => onToggleClient(client.id)}
                      label={`Select ${client.fullName}`}
                    />
                  </td>

                  <td className="clients-table-cell clients-sticky-left-number">
                    {index + 1}
                  </td>

                  <td className="clients-table-cell min-w-[210px]">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-semibold text-white">
                        {getInitials(client.fullName)}
                      </div>

                      <div className="min-w-0">
                        <div className="max-w-[150px] truncate font-medium">
                          {client.fullName}
                        </div>
                        <div className="max-w-[150px] truncate text-[10px] opacity-60">
                          {client.city ?? '—'}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="clients-table-cell max-w-[170px] truncate">
                    {client.companyName ?? '—'}
                  </td>

                  <td className="clients-table-cell">
                    {client.phone ?? client.whatsappPhone ?? '—'}
                  </td>

                  <td className="clients-table-cell max-w-[190px] truncate">
                    {client.email ?? '—'}
                  </td>

                  <td className="clients-table-cell">{client.channel}</td>
                  <td className="clients-table-cell">{client.source}</td>

                  <td className="clients-table-cell max-w-[190px] truncate">
                    {client.websiteDomain ?? '—'}
                  </td>

                  <td className="clients-table-cell max-w-[170px] truncate">
                    {client.botName ?? '—'}
                  </td>

                  <td className="clients-table-cell max-w-[170px] truncate">
                    {client.assignedSellerName ?? '—'}
                  </td>

                  <td className="clients-table-cell">
                    <ClientStatusBadge status={client.status} />
                  </td>

                  <td className="clients-table-cell">
                    <CrmMoneyPair
                      value={client.statistics.totalRevenue}
                      displayMode="dual"
                    />
                  </td>

                  <td className="clients-table-cell">
                    <CrmMoneyPair
                      value={client.statistics.totalDebt}
                      displayMode="dual"
                    />
                  </td>

                  <td className="clients-table-cell">
                    {client.lastContactAt ?? '—'}
                  </td>

                  <td className="clients-table-cell clients-sticky-right-options">
                    <ClientRowActionsMenu client={client} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase()
}
