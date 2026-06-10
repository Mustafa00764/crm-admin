import { DictationLanguage, LeadFormData } from '../model/chat.types'

export const MAX_FILES = 5
export const MAX_FILE_SIZE = 1 * 1024 * 1024 // 1 MB
export const REQUIRED_FORM_AFTER_USER_MESSAGES = 6
export const DEFAULT_ASSISTANT_MESSAGE_ID = 'default_assistant_greeting'

export const DICTATION_LANGUAGES: Array<{ value: DictationLanguage; label: string }> =
  [
    { value: 'auto', label: 'Авто' },
    { value: 'ru', label: 'RU' },
    { value: 'uz', label: 'UZ' },
    { value: 'en', label: 'EN' }
  ]

export const DEFAULT_LEAD_FORM: LeadFormData = {
  name: '',
  phone: '',
  city: '',
  comment: ''
}

export const QUICK_EMOJIS = [
  '😊',
  '🙂',
  '😄',
  '😉',
  '🤝',
  '👍',
  '👌',
  '🙏',
  '✅',
  '☑️',
  '⭐',
  '🔥',
  '💬',
  '📞',
  '📲',
  '📩',
  '📝',
  '📦',
  '🚚',
  '📍',
  '🏠',
  '🏡',
  '🏢',
  '🏗️',
  '🔧',
  '🛠️',
  '🔩',
  '🧱',
  '📐',
  '📏',
  '💰',
  '💳',
  '⏱️',
  '🎨',
  '🇺🇿'
]
