import { DEFAULT_ASSISTANT_MESSAGE_ID } from '../config/public-chat-config'
import { PublicChatMessage } from '../model/chat.types'

export function getChatStorageKey(siteId: string) {
  return `public-chat-${siteId}-messages`
}

export function getLeadFormStorageKey(siteId: string) {
  return `public-chat-${siteId}-lead-form`
}

export function getLeadFormSubmittedKey(siteId: string) {
  return `public-chat-${siteId}-lead-form-submitted`
}

export function getDefaultMessages(currentSite: string): PublicChatMessage[] {
  const siteId = currentSite?.trim() || 'default'

  const messagesBySite: Record<string, string> = {
    evroshtaketnikmoskva:
      'Здравствуйте! Я Анна 😊 Подскажу по материалам и помогу с выбором.',

    profnastilvtashkente:
      'Assalomu alaykum! Men Anna 😊 Sizga rus tilida gaplashish qulaymi yoki o‘zbek tilidami? Здравствуйте! Я Анна 😊 Вам удобнее общаться на русском или на узбекском?',

    default:
      'Здравствуйте! Я Анна 😊 Подскажу по материалам, помогу с выбором и передам заявку менеджеру.'
  }

  const content = messagesBySite[siteId] || messagesBySite.default

  return [
    {
      id: DEFAULT_ASSISTANT_MESSAGE_ID,
      role: 'assistant',
      content
    }
  ]
}
