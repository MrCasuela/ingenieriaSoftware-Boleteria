import { ref, watch } from 'vue'

export function useFormFormatting() {
  const formatCardNumber = (value) => {
    return value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim()
  }

  const formatExpiry = (value) => {
    return value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2')
  }

  const setupCardNumberFormatting = (cardNumber) => {
    watch(cardNumber, (newVal) => {
      const formatted = formatCardNumber(newVal)
      if (formatted !== newVal) {
        cardNumber.value = formatted
      }
    })
  }

  const setupExpiryFormatting = (expiry) => {
    watch(expiry, (newVal) => {
      const formatted = formatExpiry(newVal)
      if (formatted !== newVal) {
        expiry.value = formatted
      }
    })
  }

  return {
    formatCardNumber,
    formatExpiry,
    setupCardNumberFormatting,
    setupExpiryFormatting
  }
}