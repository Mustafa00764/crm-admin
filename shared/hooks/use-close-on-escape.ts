'use client'

import { useEffect } from "react"


type UseCloseOnEscapeParams = {
  open: boolean
  onClose: () => void
  enabled?: boolean
}

export function useCloseOnEscape({
  open,
  onClose,
  enabled = true
}: UseCloseOnEscapeParams) {
  useEffect(() => {
    if (!enabled) return
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose, enabled])
}
