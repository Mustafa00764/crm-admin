import { type Dispatch, type SetStateAction, useEffect } from 'react'
import {
  getChatStorageKey,
  getLeadFormStorageKey,
  getLeadFormSubmittedKey
} from '../lib/storage'
import type { LeadFormData, PublicChatMessage } from '../model/chat.types'
import { DEFAULT_LEAD_FORM } from '../config/public-chat-config'

type UseChatStorageParams = {
  siteId: string
  messages: PublicChatMessage[]
  leadForm: LeadFormData
  leadFormSubmitted: boolean
  hasHydrated: boolean
  setMessages: Dispatch<SetStateAction<PublicChatMessage[]>>
  setLeadForm: Dispatch<SetStateAction<LeadFormData>>
  setLeadFormSubmitted: Dispatch<SetStateAction<boolean>>
  setHasHydrated: Dispatch<SetStateAction<boolean>>
}

export function useChatStorage({
  siteId,
  messages,
  leadForm,
  leadFormSubmitted,
  hasHydrated,
  setMessages,
  setLeadForm,
  setLeadFormSubmitted,
  setHasHydrated
}: UseChatStorageParams) {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const loadSavedState = () => {
      try {
        const savedMessages = sessionStorage.getItem(getChatStorageKey(siteId))

        if (savedMessages) {
          const parsedMessages = JSON.parse(
            savedMessages
          ) as PublicChatMessage[]

          if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
            setMessages(parsedMessages)
          }
        }
      } catch (error) {
        console.error('Local chat load error:', error)
      }

      try {
        const savedLeadForm = sessionStorage.getItem(
          getLeadFormStorageKey(siteId)
        )

        if (savedLeadForm) {
          setLeadForm({
            ...DEFAULT_LEAD_FORM,
            ...JSON.parse(savedLeadForm)
          })
        }
      } catch (error) {
        console.error('Lead form load error:', error)
      }

      try {
        setLeadFormSubmitted(
          sessionStorage.getItem(getLeadFormSubmittedKey(siteId)) === 'true'
        )
      } catch (error) {
        console.error('Lead form submitted load error:', error)
      }

      setHasHydrated(true)
    }

    window.queueMicrotask(loadSavedState)
  }, [siteId, setMessages, setLeadForm, setLeadFormSubmitted, setHasHydrated])

  useEffect(() => {
    if (!hasHydrated) return

    try {
      sessionStorage.setItem(
        getChatStorageKey(siteId),
        JSON.stringify(messages)
      )
    } catch (error) {
      console.error('Local chat save error:', error)
    }
  }, [messages, siteId, hasHydrated])

  useEffect(() => {
    if (!hasHydrated) return

    try {
      sessionStorage.setItem(
        getLeadFormStorageKey(siteId),
        JSON.stringify(leadForm)
      )
    } catch (error) {
      console.error('Lead form save error:', error)
    }
  }, [leadForm, siteId, hasHydrated])

  useEffect(() => {
    if (!hasHydrated) return

    try {
      sessionStorage.setItem(
        getLeadFormSubmittedKey(siteId),
        String(leadFormSubmitted)
      )
    } catch (error) {
      console.error('Lead form submitted save error:', error)
    }
  }, [leadFormSubmitted, siteId, hasHydrated])
}
