'use client'

import * as React from 'react'
import { Pencil, Pin, PinOff, Plus, Trash2, X } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { useCRMStore } from '@/entities/crm/model/crm-store'
import type { CRMOrder, OrderNoteType } from '../model/orders-types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/ui/select'

const noteTypes: Array<{ value: OrderNoteType; label: string }> = [
  { value: 'general', label: 'General' },
  { value: 'payment', label: 'Payment' },
  { value: 'production', label: 'Production' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'return', label: 'Return' },
  { value: 'loss', label: 'Loss' },
  { value: 'internal', label: 'Internal' }
]

export function OrderNotesPanel({ order }: { order: CRMOrder }) {
  const { addOrderNote, updateOrderNote, deleteOrderNote } = useCRMStore()

  const [type, setType] = React.useState<OrderNoteType>('general')
  const [text, setText] = React.useState('')
  const [pinned, setPinned] = React.useState(false)
  const [pending, setPending] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)

  const sortedNotes = React.useMemo(() => {
    return [...order.notes].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1

      return b.createdAt.localeCompare(a.createdAt)
    })
  }, [order.notes])

  const saveNote = async () => {
    const value = text.trim()

    if (!value) return

    const payload = {
      type,
      text: value,
      pinned
    }

    setPending(true)

    try {
      if (editingId) {
        await updateOrderNote(order.id, editingId, payload)
      } else {
        await addOrderNote(order.id, payload)
      }

      resetForm()
    } finally {
      setPending(false)
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setText('')
    setPinned(false)
    setType('general')
  }

  const startEdit = (note: CRMOrder['notes'][number]) => {
    setEditingId(note.id)
    setType(note.type)
    setText(note.text)
    setPinned(note.pinned)
  }

  return (
    <section className="rounded-md border border-[var(--cf-border)] bg-[var(--cf-element)] p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-[13px] font-semibold text-[var(--cf-text)]">
            Order notes
          </h3>
          <p className="mt-0.5 text-[10px] text-[var(--cf-text-muted)]">
            Внутренние заметки менеджера по заказу
          </p>
        </div>

        <Badge className="bg-[var(--cf-button)] text-[10px] text-[var(--cf-text)]">
          {order.notes.length} notes
        </Badge>
      </div>

      <div className="mb-3 rounded-md border border-[var(--cf-border)] bg-[var(--cf-bg)] p-2">
        <div className="mb-2 grid grid-cols-[1fr_auto] gap-2">
          <Select
            value={type}
            onValueChange={value => setType(value as OrderNoteType)}
          >
            <SelectTrigger className="h-8 border border-[var(--cf-border)] bg-[var(--cf-element)] px-2 text-[11px] text-[var(--cf-text)] focus:ring-0 focus:ring-offset-0">
              <SelectValue placeholder="Note type" />
            </SelectTrigger>

            <SelectContent className="border border-[var(--cf-border)] bg-[var(--cf-bg)] text-[var(--cf-text)]">
              {noteTypes.map(item => (
                <SelectItem
                  key={item.value}
                  value={item.value}
                  className="text-[11px] focus:bg-[var(--cf-element-hover)] focus:text-[var(--cf-text)]"
                >
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--cf-button)] text-[var(--cf-text)]"
            onClick={() => setPinned(current => !current)}
          >
            {pinned ? (
              <Pin className="h-3.5 w-3.5 text-[var(--cf-yellow)]" />
            ) : (
              <PinOff className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        <textarea
          value={text}
          onChange={event => setText(event.target.value)}
          placeholder="Напишите внутреннюю заметку по заказу..."
          className="min-h-[86px] w-full resize-none rounded-md border border-[var(--cf-border)] bg-[var(--cf-element)] px-3 py-2 text-[12px] text-[var(--cf-text)] outline-none placeholder:text-[var(--cf-text-muted)]"
        />

        <div className="mt-2 flex justify-end">
          <Button
            type="button"
            variant="ghost"
            disabled={pending}
            className="h-8 rounded-md bg-[var(--cf-button)] px-3 text-[11px] text-[var(--cf-text)] disabled:opacity-60"
            onClick={() => void saveNote()}
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            {editingId ? 'Save' : 'Add note'}
          </Button>

          {editingId ? (
            <Button
              type="button"
              variant="ghost"
              disabled={pending}
              className="ml-2 h-8 rounded-md bg-[var(--cf-button)] px-3 text-[11px] text-[var(--cf-text)] hover:bg-[var(--cf-element-hover)]"
              onClick={resetForm}
            >
              <X className="mr-1 h-3.5 w-3.5" />
              Cancel
            </Button>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        {sortedNotes.map(note => (
          <div
            key={note.id}
            className="rounded-md border border-[var(--cf-border)] bg-[var(--cf-bg)] p-2"
          >
            <div className="mb-1 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {note.pinned ? (
                  <Pin className="h-3.5 w-3.5 text-[var(--cf-yellow)]" />
                ) : null}

                <Badge className="bg-[var(--cf-button)] text-[10px] text-[var(--cf-text)]">
                  {note.type}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-[10px] text-[var(--cf-text-muted)]">
                  {note.createdAt}
                </div>

                  <button
                    type="button"
                    className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--cf-button)] text-[var(--cf-text)] hover:bg-[var(--cf-element-hover)]"
                    onClick={event => {
                      event.stopPropagation()
                      startEdit(note)
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    className="flex h-7 w-7 items-center justify-center rounded-md bg-[rgba(239,23,72,0.12)] text-[var(--cf-red)] hover:bg-[rgba(239,23,72,0.2)]"
                    onClick={event => {
                      event.stopPropagation()

                      const confirmed = window.confirm('Удалить эту заметку?')

                      if (!confirmed) return

                      void deleteOrderNote(order.id, note.id)
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
              </div>
            </div>

            <div className="text-[12px] leading-5 text-[var(--cf-text)]">
              {note.text}
            </div>

            <div className="mt-1 text-[10px] text-[var(--cf-text-muted)]">
              {note.authorName}
            </div>
          </div>
        ))}

        {sortedNotes.length === 0 ? (
          <div className="text-[11px] text-[var(--cf-text-muted)]">
            Заметок пока нет
          </div>
        ) : null}
      </div>
    </section>
  )
}
