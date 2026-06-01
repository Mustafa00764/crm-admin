"use client"

import * as React from "react"
import { Edit3, Pin, PinOff, Plus, Save, Trash2, X } from "lucide-react"
import type { ClientNote, CRMClient } from "../model/clients-types"
import { useCRMStore } from "@/entities/crm/model/crm-store"
import { Button } from "@/shared/ui/button"
import { Textarea } from "@/shared/ui/textarea"
import { Badge } from "@/shared/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"

type ClientNotesPanelProps = {
  client: CRMClient
}

type NoteType = ClientNote["type"]

const noteTypes: Array<[NoteType, string]> = [
  ["general", "General"],
  ["important", "Important"],
  ["payment", "Payment"],
  ["delivery", "Delivery"],
  ["return", "Return"],
  ["order", "Order"],
  ["manager_private", "Private"],
]

export function ClientNotesPanel({ client }: ClientNotesPanelProps) {
  const { updateClient } = useCRMStore()

  const [mode, setMode] = React.useState<"idle" | "create" | "edit">("idle")
  const [editingNoteId, setEditingNoteId] = React.useState<string | null>(null)
  const [type, setType] = React.useState<NoteType>("general")
  const [text, setText] = React.useState("")
  const [pinned, setPinned] = React.useState(false)

  const resetForm = () => {
    setMode("idle")
    setEditingNoteId(null)
    setType("general")
    setText("")
    setPinned(false)
  }

  const startCreate = () => {
    setMode("create")
    setEditingNoteId(null)
    setType("general")
    setText("")
    setPinned(false)
  }

  const startEdit = (note: ClientNote) => {
    setMode("edit")
    setEditingNoteId(note.id)
    setType(note.type)
    setText(note.text)
    setPinned(note.pinned)
  }

  const saveNote = async () => {
    const normalizedText = text.trim()

    if (!normalizedText) return

    if (mode === "create") {
      const nextNote: ClientNote = {
        id: createId("note"),
        type,
        text: normalizedText,
        pinned,
        authorName: "Manager",
        createdAt: new Date().toLocaleString("ru-RU"),
      }

      await updateClient(client.id, {
        notes: [nextNote, ...client.notes],
      })

      resetForm()
      return
    }

    if (mode === "edit" && editingNoteId) {
      await updateClient(client.id, {
        notes: client.notes.map((note) =>
          note.id === editingNoteId
            ? {
                ...note,
                type,
                text: normalizedText,
                pinned,
                updatedAt: new Date().toISOString(),
              }
            : note
        ),
      })

      resetForm()
    }
  }

  const deleteNote = async (noteId: string) => {
    await updateClient(client.id, {
      notes: client.notes.filter((note) => note.id !== noteId),
    })

    if (editingNoteId === noteId) {
      resetForm()
    }
  }

  return (
    <section className="cf-panel-soft p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="text-[12px] font-semibold text-[var(--cf-text)]">
          Notes
        </div>

        <Button
          type="button"
          variant="ghost"
          className="h-7 rounded-md bg-[var(--cf-button)] px-2 text-[11px] text-[var(--cf-text)] hover:bg-[var(--cf-element-hover)]"
          onClick={startCreate}
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          Add
        </Button>
      </div>

      {mode !== "idle" ? (
        <div className="mb-3 rounded-md border border-[var(--cf-border)] bg-[var(--cf-element)] p-2">
          <div className="mb-2 grid grid-cols-[1fr_auto] gap-2">
            <Select value={type} onValueChange={(value) => setType(value as NoteType)}>
              <SelectTrigger className="cf-control h-8 px-2 text-[11px]">
                <SelectValue />
              </SelectTrigger>

              <SelectContent className="cf-panel">
                {noteTypes.map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant="ghost"
              className="h-8 rounded-md bg-[var(--cf-button)] px-2 text-[var(--cf-text)]"
              onClick={() => setPinned((current) => !current)}
            >
              {pinned ? (
                <Pin className="h-3.5 w-3.5 text-[var(--cf-yellow)]" />
              ) : (
                <PinOff className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>

          <Textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Напишите заметку о клиенте..."
            className="min-h-[92px] resize-none border-[var(--cf-border)] bg-[var(--cf-bg)] text-[12px] text-[var(--cf-text)] placeholder:text-[var(--cf-text-muted)]"
          />

          <div className="mt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              className="h-8 rounded-md bg-[var(--cf-element)] px-3 text-[11px] text-[var(--cf-text)]"
              onClick={resetForm}
            >
              <X className="mr-1 h-3.5 w-3.5" />
              Cancel
            </Button>

            <Button
              type="button"
              className="h-8 rounded-md bg-[var(--cf-button)] px-3 text-[11px] text-[var(--cf-text)] hover:bg-[var(--cf-element-hover)]"
              onClick={() => void saveNote()}
            >
              <Save className="mr-1 h-3.5 w-3.5" />
              Save
            </Button>
          </div>
        </div>
      ) : null}

      {client.notes.length === 0 ? (
        <div className="text-[11px] text-[var(--cf-text-muted)]">
          Заметок нет. Нажмите Add, чтобы оставить заметку о клиенте.
        </div>
      ) : (
        <div className="space-y-2">
          {client.notes.map((note) => (
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
                    onClick={() => void deleteNote(note.id)}
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
                <span>{note.updatedAt ? "updated" : note.createdAt}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`
}