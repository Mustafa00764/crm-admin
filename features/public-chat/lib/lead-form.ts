import type { LeadFormData, PublicChatMessage } from '../model/chat.types'
import { uid } from './uid'
import { isValidPhone } from './phone'
import { Dispatch, SetStateAction } from 'react'

type SubmitLeadFormParams = {
  leadForm: LeadFormData
  pageUrl: string
  siteId: string
  messages: PublicChatMessage[]
  setPhoneError: Dispatch<SetStateAction<string>>
  setLeadFormSubmitted: Dispatch<SetStateAction<boolean>>
  setLeadFormOpen: Dispatch<SetStateAction<boolean>>
  setFormState: Dispatch<SetStateAction<'open' | 'close'>>
  setMessages: Dispatch<SetStateAction<PublicChatMessage[]>>
  isPending: boolean
  setIsPending: Dispatch<SetStateAction<boolean>>
}

export async function submitLeadForm({
  leadForm,
  pageUrl,
  siteId,
  messages,
  setPhoneError,
  setLeadFormSubmitted,
  setLeadFormOpen,
  setFormState,
  setMessages,
  // isPending,
  setIsPending
}: SubmitLeadFormParams) {
  const phone = leadForm.phone.trim()

  if (!phone) {
    setPhoneError('Укажите номер телефона')
    return
  }

  const currentSite = siteId === 'profnastilvtashkente' ? 'uz' : 'ru'

  if (!isValidPhone(phone, currentSite)) {
    if (currentSite === 'uz') {
      setPhoneError('Введите номер в формате +998 XX XXX XX XX')
    } else {
      setPhoneError('Введите номер в формате +7 XXX XXX XX XX')
    }
    return
  }

  setIsPending(true)

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
        messages,
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
  } finally {
    setIsPending(false)
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
