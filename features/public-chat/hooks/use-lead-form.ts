import { useState } from 'react'
import type { LeadFormData } from '../model/chat.types'
import { DEFAULT_LEAD_FORM } from '../config/public-chat-config'

export function useLeadForm() {
  const [phoneError, setPhoneError] = useState('')
  const [leadFormOpen, setLeadFormOpen] = useState(false)
  const [formState, setFormState] = useState<'open' | 'close'>('open')
  const [leadFormSubmitted, setLeadFormSubmitted] = useState(false)
  const [leadForm, setLeadForm] = useState<LeadFormData>(DEFAULT_LEAD_FORM)
  const [isPending, setIsPending] = useState<boolean>(false)

  return {
    phoneError,
    setPhoneError,

    leadFormOpen,
    setLeadFormOpen,

    formState,
    setFormState,

    leadFormSubmitted,
    setLeadFormSubmitted,

    leadForm,
    setLeadForm,

    isPending,
    setIsPending
  }
}
