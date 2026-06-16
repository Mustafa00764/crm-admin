import type { ReactNode } from 'react'

const URL_PATTERN = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi

export function linkifyText(text: string): ReactNode[] {
  return text.split(URL_PATTERN).map((part, index) => {
    const isUrl = /^(https?:\/\/|www\.)/i.test(part)

    if (!isUrl) {
      return part
    }

    // Убираем точку, запятую и другие знаки после ссылки.
    const match = part.match(/^(.*?)([.,!?;:)\]]*)$/)

    const url = match?.[1] ?? part
    const punctuation = match?.[2] ?? ''

    const href = url.startsWith('www.') ? `https://${url}` : url

    return (
      <span key={`${url}-${index}`}>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          {url}
        </a>

        {punctuation}
      </span>
    )
  })
}
