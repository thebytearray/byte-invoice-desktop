export const APP_VERSION = '1.0.0'

export const STORAGE_KEYS = {
  BYTE_INVOICE_DATA: 'byte-invoice-storage',
} as const

export const INVOICE_STATUS = {
  DRAFT: 'draft',
  SENT: 'sent',
  PAID: 'paid',
  OVERDUE: 'overdue',
} as const

export const INVOICE_STATUS_COLORS = {
  [INVOICE_STATUS.DRAFT]: 'gray',
  [INVOICE_STATUS.SENT]: 'blue',
  [INVOICE_STATUS.PAID]: 'green',
  [INVOICE_STATUS.OVERDUE]: 'red',
} as const

export const DEFAULT_TAX_RATE = 0
export const DEFAULT_DISCOUNT_RATE = 0
export const DEFAULT_DUE_DAYS = 30

export const CURRENCY_SYMBOL = '$'
export const DATE_FORMAT = 'MMM dd, yyyy'

export const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Invalid email address',
  MIN_QUANTITY: 'Quantity must be at least 1',
  POSITIVE_NUMBER: 'Must be a positive number',
  MAX_PERCENTAGE: 'Cannot exceed 100%',
} as const
