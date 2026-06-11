import type { LeadFormData, PublicChatMessage } from '../model/chat.types'
import { uid } from './uid'
import { isValidPhone } from './phone'
import { Dispatch, SetStateAction } from 'react'

type SubmitLeadFormParams = {
  leadForm: LeadFormData
  pageUrl: string
  siteId: string
  setPhoneError: Dispatch<SetStateAction<string>>
  setLeadFormSubmitted: Dispatch<SetStateAction<boolean>>
  setLeadFormOpen: Dispatch<SetStateAction<boolean>>
  setFormState: Dispatch<SetStateAction<'open' | 'close'>>
  setMessages: Dispatch<SetStateAction<PublicChatMessage[]>>
}

export async function submitLeadForm({
  leadForm,
  pageUrl,
  siteId,
  setPhoneError,
  setLeadFormSubmitted,
  setLeadFormOpen,
  setFormState,
  setMessages
}: SubmitLeadFormParams) {
  const phone = leadForm.phone.trim()

  if (!phone) {
    setPhoneError('Укажите номер телефона')
    return
  }

  try {
    await fetch('/api/send-lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone,
        clientName: leadForm.name,
        deliveryCity: leadForm.city,
        comment: {
          text: leadForm.comment || 'Нет',
          pageUrl,
          siteId,
          attachments: []
        }
      })
    })
  } catch (error) {
    console.error('Lead form send error:', error)
  }

  setLeadFormSubmitted(true)
  setLeadFormOpen(false)
  setFormState('close')

  setMessages(current => [
    ...current,
    {
      id: uid(),
      role: 'assistant',
      content:
        'Спасибо, заявку передала менеджеру. Можете продолжать писать здесь — я помогу сориентироваться дальше.'
    }
  ])
}
