export const PUBLIC_PHONE_DISPLAY = '+90 532 449 94 55'
export const PUBLIC_PHONE_TEL = 'tel:+905324499455'
export const PUBLIC_WHATSAPP_URL = 'https://wa.me/905324499455'

type PublicContactFields = {
  contactPhone: string
  contactPhoneSecondary: string
  whatsappUrl: string
}

export function withPublicContactDetails<T extends PublicContactFields>(settings: T): T {
  return {
    ...settings,
    contactPhone: PUBLIC_PHONE_DISPLAY,
    contactPhoneSecondary: '',
    whatsappUrl: PUBLIC_WHATSAPP_URL,
  }
}
