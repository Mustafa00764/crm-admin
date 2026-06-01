'use client'

import * as React from 'react'
import { Edit3, Pin, PinOff, Plus, Save, Trash2, X } from 'lucide-react'
import type { CRMDeal, DealNote, DealNoteType } from '../model/deals-types'
import { useCRMStore } from '@/entities/crm/model/crm-store'
import { Badge } from '@/shared/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

type DealNotesPanelProps = {
  deal: CRMDeal
}

const noteTypes: Array<[DealNoteType, string]> = [
  ['general', 'General'],
  ['important', 'Important'],
  ['payment', 'Payment'],
  ['delivery', 'Delivery'],
  ['production', 'Production'],
  ['discount', 'Discount'],
  ['manager_private', 'Private']
]

export function DealNotesPanel({ deal }: DealNotesPanelProps) {
  const { addDealNote, updateDealNote, deleteDealNote } = useCRMStore()

  const [mode, setMode] = React.useState<'idle' | 'create' | 'edit'>('idle')
  const [editingNoteId, setEditingNoteId] = React.useState<string | null>(null)
  const [type, setType] = React.useState<DealNoteType>('general')
  const [text, setText] = React.useState('')
  const [pinned, setPinned] = React.useState(false)

  const resetForm = () => {
    setMode('idle')
    setEditingNoteId(null)
    setType('general')
    setText('')
    setPinned(false)
  }

  const startCreate = () => {
    setMode('create')
    setEditingNoteId(null)
    setType('general')
    setText('')
    setPinned(false)
  }

  const startEdit = (note: DealNote) => {
    setMode('edit')
    setEditingNoteId(note.id)
    setType(note.type)
    setText(note.text)
    setPinned(note.pinned)
  }

  const saveNote = async () => {
    const normalizedText = text.trim()

    if (!normalizedText) return

    if (mode === 'create') {
      await addDealNote(deal.id, {
        type,
        text: normalizedText,
        pinned
      })

      resetForm()
      return
    }

    if (mode === 'edit' && editingNoteId) {
      await updateDealNote(deal.id, editingNoteId, {
        type,
        text: normalizedText,
        pinned
      })

      resetForm()
    }
  }

  const sortedNotes = [...deal.notes].sort((a, b) => {
    if (a.pinned === b.pinned) return 0
    return a.pinned ? -1 : 1
  })

  return (
    <section className="cf-panel-soft p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="text-[12px] font-semibold text-[var(--cf-text)]">
          Manager notes
        </div>

        <button
          type="button"
          className="flex h-7 items-center rounded-md bg-[var(--cf-button)] px-2 text-[11px] text-[var(--cf-text)] hover:bg-[var(--cf-element-hover)]"
          onClick={startCreate}
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          Add
        </button>
      </div>

      {mode !== 'idle' ? (
        <div className="mb-3 rounded-md border border-[var(--cf-border)] bg-[var(--cf-element)] p-2">
          <div className="mb-2 grid grid-cols-[1fr_auto] gap-2">
            <Select
              value={type}
              onValueChange={value => setType(value as DealNoteType)}
            >
              <SelectTrigger className="h-8 border border-[var(--cf-border)] bg-[var(--cf-bg)] px-2 text-[11px] text-[var(--cf-text)] outline-none focus:ring-0 focus:ring-offset-0">
                <SelectValue placeholder="Тип заметки" />
              </SelectTrigger>

              <SelectContent className="border border-[var(--cf-border)] bg-[var(--cf-bg)] text-[var(--cf-text)]">
                {noteTypes.map(([value, label]) => (
                  <SelectItem
                    key={value}
                    value={value}
                    className="text-[11px] focus:bg-[var(--cf-element-hover)] focus:text-[var(--cf-text)]"
                  >
                    {label}
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
            placeholder="Напишите внутреннюю заметку по сделке..."
            className="min-h-[92px] w-full resize-none rounded-md border border-[var(--cf-border)] bg-[var(--cf-bg)] px-3 py-2 text-[12px] text-[var(--cf-text)] outline-none placeholder:text-[var(--cf-text-muted)]"
          />

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              className="flex h-8 items-center rounded-md bg-[var(--cf-element)] px-3 text-[11px] text-[var(--cf-text)]"
              onClick={resetForm}
            >
              <X className="mr-1 h-3.5 w-3.5" />
              Cancel
            </button>

            <button
              type="button"
              className="flex h-8 items-center rounded-md bg-[var(--cf-button)] px-3 text-[11px] text-[var(--cf-text)] hover:bg-[var(--cf-element-hover)]"
              onClick={() => void saveNote()}
            >
              <Save className="mr-1 h-3.5 w-3.5" />
              Save
            </button>
          </div>
        </div>
      ) : null}

      {sortedNotes.length === 0 ? (
        <div className="text-[11px] text-[var(--cf-text-muted)]">
          Внутренних заметок по сделке пока нет.
        </div>
      ) : (
        <div className="space-y-2">
          {sortedNotes.map(note => (
            <div
              key={note.id}
              className="rounded-md border border-[var(--cf-border)] bg-[var(--cf-element)] p-2"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Badge className="bg-[var(--cf-button)] text-[var(--cf-text)]">
                    {note.type}
                  </Badge>

                  {note.pinned ? (
                    <Pin className="h-3.5 w-3.5 text-[var(--cf-yellow)]" />
                  ) : null}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    className="text-[var(--cf-icon)] hover:text-[var(--cf-text)]"
                    onClick={() => startEdit(note)}
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    className="text-[var(--cf-red)]"
                    onClick={() => void deleteDealNote(deal.id, note.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="whitespace-pre-wrap text-[11px] leading-5 text-[var(--cf-text)]">
                {note.text}
              </div>

              <div className="mt-2 flex justify-between gap-2 text-[10px] text-[var(--cf-text-muted)]">
                <span>{note.authorName}</span>
                <span>{note.updatedAt ? 'updated' : note.createdAt}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
