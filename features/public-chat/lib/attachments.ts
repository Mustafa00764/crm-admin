import { PublicChatAttachment } from "../model/chat.types"

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject

    reader.readAsDataURL(file)
  })
}

export function isImageFile(file: PublicChatAttachment) {
  return file.type.startsWith('image/')
}