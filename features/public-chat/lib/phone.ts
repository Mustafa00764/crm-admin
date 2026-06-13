type PhoneCountry = 'uz' | 'ru'

export function getPhoneCountryBySite(siteId?: string): PhoneCountry {
  if (siteId === 'profnastilvtashkente') return 'uz'
  if (siteId === 'evroshtaketnikmoskva') return 'ru'

  return 'ru'
}

function normalizeDigits(value: string) {
  return value.replace(/\D/g, '')
}

function extractUzPhone(text: string): string | null {
  const phoneRegex =
    /(?:\+?\s*998[\s\-()]*)?(?:\d{2}[\s\-()]*\d{3}[\s\-()]*\d{2}[\s\-()]*\d{2})/

  const match = text.match(phoneRegex)

  if (!match) return null

  const digits = normalizeDigits(match[0])

  if (digits.startsWith('998') && digits.length === 12) {
    return `+${digits}`
  }

  if (digits.length === 9) {
    return `+998${digits}`
  }

  return null
}

function extractRuPhone(text: string): string | null {
  const phoneRegex =
    /(?:\+?\s*7|8)?[\s\-()]*(?:\d{3}[\s\-()]*)\d{3}[\s\-()]*\d{2}[\s\-()]*\d{2}/

  const match = text.match(phoneRegex)

  if (!match) return null

  let digits = normalizeDigits(match[0])

  if (digits.length === 11 && digits.startsWith('8')) {
    digits = `7${digits.slice(1)}`
  }

  if (digits.length === 11 && digits.startsWith('7')) {
    return `+${digits}`
  }

  if (digits.length === 10) {
    return `+7${digits}`
  }

  return null
}

// export function extractPhone(
//   text: string,
//   countryOrSiteId: PhoneCountry | string = 'ru'
// ): string | null {
//   const country =
//     countryOrSiteId === 'uz' || countryOrSiteId === 'ru'
//       ? countryOrSiteId
//       : getPhoneCountryBySite(countryOrSiteId)

//   if (country === 'uz') {
//     return extractUzPhone(text)
//   }

//   return extractRuPhone(text)
// }

export function extractPhone(
  text: string,
  countryOrSiteId: PhoneCountry | string = 'ru'
): string | null {
  const country =
    countryOrSiteId === 'uz' || countryOrSiteId === 'ru'
      ? countryOrSiteId
      : getPhoneCountryBySite(countryOrSiteId)

  // Если явно указан uz — только узбекский парсер
  if (country === 'uz') {
    return extractUzPhone(text)
  }

  // Даже если страна ru — сначала проверяем, не узбекский ли номер
  const digits = text.replace(/\D/g, '')
  if (digits.startsWith('998')) {
    return null // это узбекский номер, не парсим как русский
  }

  return extractRuPhone(text)
}

export function formatUzPhone(value: string) {
  let digits = normalizeDigits(value)

  if (digits.startsWith('998')) {
    digits = digits.slice(3)
  }

  digits = digits.slice(0, 9)

  const operator = digits.slice(0, 2)
  const part1 = digits.slice(2, 5)
  const part2 = digits.slice(5, 7)
  const part3 = digits.slice(7, 9)

  let result = '+998'

  if (operator) result += ` ${operator}`
  if (part1) result += ` ${part1}`
  if (part2) result += ` ${part2}`
  if (part3) result += ` ${part3}`

  return result
}

export function formatRuPhone(value: string) {
  let digits = value.replace(/\D/g, '')

  if (digits.startsWith('8')) {
    digits = `7${digits.slice(1)}`
  }

  if (digits.startsWith('7')) {
    digits = digits.slice(1)
  }

  digits = digits.slice(0, 10)

  const code = digits.slice(0, 3)
  const part1 = digits.slice(3, 6)
  const part2 = digits.slice(6, 8)
  const part3 = digits.slice(8, 10)

  let result = '+7'

  if (code) result += ` ${code}`
  if (part1) result += ` ${part1}`
  if (part2) result += ` ${part2}`
  if (part3) result += ` ${part3}`

  return result
}

export function formatPhone(value: string, country: PhoneCountry = 'ru') {
  if (country === 'uz') return formatUzPhone(value)

  return formatRuPhone(value)
}

export function isValidUzPhone(value: string) {
  const digits = normalizeDigits(value)

  return digits.startsWith('998') && digits.length === 12
}

export function isValidRuPhone(value: string) {
  let digits = normalizeDigits(value)

  if (digits.startsWith('8') && digits.length === 11) {
    digits = `7${digits.slice(1)}`
  }

  return digits.startsWith('7') && digits.length === 11
}

export function isValidPhone(value: string, country: PhoneCountry = 'ru') {
  if (country === 'uz') return isValidUzPhone(value)

  return isValidRuPhone(value)
}

export function getPhoneCountryByValue(
  value: string,
  siteId?: string
): 'ru' | 'uz' {
  const digits = value.replace(/\D/g, '')

  if (digits.startsWith('998')) return 'uz'
  if (digits.startsWith('7')) return 'ru'
  if (digits.startsWith('8')) return 'ru'

  return getPhoneCountryBySite(siteId)
}

export function formatAnyPhone(value: string) {
  const country = getPhoneCountryByValue(value)

  if (country === 'uz') {
    return formatUzPhone(value)
  }

  return formatRuPhone(value)
}

export async function sendLeadFromRealtimeTranscript(
  text: string,
  pageUrl: string,
  siteId: string
) {
  const phone = extractPhone(text, siteId)

  if (!phone) return

  try {
    await fetch('/api/send-lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone,
        comment: {
          text,
          pageUrl,
          siteId,
          source: 'realtime-voice',
          attachments: []
        }
      })
    })
  } catch (error) {
    console.error('Realtime lead send error:', error)
  }
}
