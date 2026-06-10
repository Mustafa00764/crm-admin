export function extractPhone(text: string): string | null {
  const phoneRegex =
    /(?:\+?\s*998[\s\-()]*)?(?:\d{2}[\s\-()]*\d{3}[\s\-()]*\d{2}[\s\-()]*\d{2})/

  const match = text.match(phoneRegex)

  if (!match) return null

  const digits = match[0].replace(/\D/g, '')

  if (digits.startsWith('998') && digits.length === 12) {
    return `+${digits}`
  }

  if (digits.length === 9) {
    return `+998${digits}`
  }

  return null
}

export function formatUzPhone(value: string) {
  let digits = value.replace(/\D/g, '')

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

export function isValidUzPhone(value: string) {
  const digits = value.replace(/\D/g, '')
  return digits.startsWith('998') && digits.length === 12
}

export async function sendLeadFromRealtimeTranscript(text: string, pageUrl: string, siteId: string) {
  const phone = extractPhone(text)

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
