/**
 * Validation utility functions for API endpoints
 * All error messages are in Vietnamese
 */

export interface ValidationResult {
  isValid: boolean
  message?: string
}

/**
 * Validates that a value is a non-empty string
 */
export function validateString(value: unknown, fieldName: string): ValidationResult {
  if (value === undefined || value === null) {
    return {
      isValid: false,
      message: `${fieldName} là bắt buộc.`,
    }
  }

  if (typeof value !== "string") {
    return {
      isValid: false,
      message: `${fieldName} phải là chuỗi ký tự.`,
    }
  }

  if (value.trim().length === 0) {
    return {
      isValid: false,
      message: `${fieldName} không được để trống.`,
    }
  }

  // Check if string is purely numeric (name cannot be a number)
  if (/^\d+$/.test(value.trim())) {
    return {
      isValid: false,
      message: `${fieldName} không được là số.`,
    }
  }

  return { isValid: true }
}

/**
 * Validates that a value is a valid email
 */
export function validateEmail(email: unknown): ValidationResult {
  const stringResult = validateString(email, "Email")
  if (!stringResult.isValid) {
    return stringResult
  }

  if (typeof email !== "string") {
    return {
      isValid: false,
      message: "Email phải là chuỗi ký tự.",
    }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.trim())) {
    return {
      isValid: false,
      message: "Email không hợp lệ.",
    }
  }

  return { isValid: true }
}

/**
 * Validates that a value is a non-negative number
 */
export function validateNonNegativeNumber(
  value: unknown,
  fieldName: string
): ValidationResult {
  if (value === undefined || value === null) {
    return {
      isValid: false,
      message: `${fieldName} là bắt buộc.`,
    }
  }

  const numValue = Number(value)
  if (Number.isNaN(numValue)) {
    return {
      isValid: false,
      message: `${fieldName} phải là số.`,
    }
  }

  if (numValue < 0) {
    return {
      isValid: false,
      message: `${fieldName} không được là số âm.`,
    }
  }

  return { isValid: true }
}

/**
 * Validates that a value is a positive integer
 */
export function validatePositiveInteger(
  value: unknown,
  fieldName: string
): ValidationResult {
  if (value === undefined || value === null) {
    return {
      isValid: false,
      message: `${fieldName} là bắt buộc.`,
    }
  }

  const numValue = Number(value)
  if (Number.isNaN(numValue) || !Number.isInteger(numValue)) {
    return {
      isValid: false,
      message: `${fieldName} phải là số nguyên.`,
    }
  }

  if (numValue <= 0) {
    return {
      isValid: false,
      message: `${fieldName} phải là số nguyên dương.`,
    }
  }

  return { isValid: true }
}

/**
 * Validates that a value is a valid year (reasonable range)
 */
export function validateYear(value: unknown, fieldName: string): ValidationResult {
  if (value === undefined || value === null) {
    return { isValid: true } // Year is optional
  }

  const numValue = Number(value)
  if (Number.isNaN(numValue) || !Number.isInteger(numValue)) {
    return {
      isValid: false,
      message: `${fieldName} phải là số nguyên.`,
    }
  }

  const currentYear = new Date().getFullYear()
  if (numValue < 1900 || numValue > currentYear) {
    return {
      isValid: false,
      message: `${fieldName} phải nằm trong khoảng 1900 đến ${currentYear}.`,
    }
  }

  return { isValid: true }
}

/**
 * Validates that a value is a valid phone number (Vietnamese format)
 */
export function validatePhoneNumber(phoneNumber: unknown): ValidationResult {
  if (phoneNumber === undefined || phoneNumber === null || phoneNumber === "") {
    return { isValid: true } // Phone number is optional
  }

  if (typeof phoneNumber !== "string") {
    return {
      isValid: false,
      message: "Số điện thoại phải là chuỗi ký tự.",
    }
  }

  // Vietnamese phone number format: 10-11 digits, may start with 0 or +84
  const phoneRegex = /^(\+84|0)[1-9][0-9]{8,9}$/
  const cleanedPhone = phoneNumber.replace(/\s+/g, "")

  if (!phoneRegex.test(cleanedPhone)) {
    return {
      isValid: false,
      message: "Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam (10-11 chữ số).",
    }
  }

  return { isValid: true }
}

/**
 * Validates that a value is a valid UUID
 */
export function validateUUID(value: unknown, fieldName: string): ValidationResult {
  if (value === undefined || value === null) {
    return {
      isValid: false,
      message: `${fieldName} là bắt buộc.`,
    }
  }

  if (typeof value !== "string") {
    return {
      isValid: false,
      message: `${fieldName} phải là chuỗi ký tự.`,
    }
  }

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(value)) {
    return {
      isValid: false,
      message: `${fieldName} không hợp lệ.`,
    }
  }

  return { isValid: true }
}

/**
 * Validates that a value is a non-empty array
 */
export function validateNonEmptyArray(
  value: unknown,
  fieldName: string
): ValidationResult {
  if (value === undefined || value === null) {
    return {
      isValid: false,
      message: `${fieldName} là bắt buộc.`,
    }
  }

  if (!Array.isArray(value)) {
    return {
      isValid: false,
      message: `${fieldName} phải là mảng.`,
    }
  }

  if (value.length === 0) {
    return {
      isValid: false,
      message: `${fieldName} không được để trống.`,
    }
  }

  return { isValid: true }
}

/**
 * Validates that a value is a valid array of numbers
 */
export function validateNumberArray(
  value: unknown,
  fieldName: string
): ValidationResult {
  const arrayResult = validateNonEmptyArray(value, fieldName)
  if (!arrayResult.isValid) {
    return arrayResult
  }

  if (!Array.isArray(value)) {
    return {
      isValid: false,
      message: `${fieldName} phải là mảng.`,
    }
  }

  for (let i = 0; i < value.length; i++) {
    const numValue = Number(value[i])
    if (Number.isNaN(numValue) || numValue <= 0) {
      return {
        isValid: false,
        message: `${fieldName} phải chứa các số nguyên dương hợp lệ.`,
      }
    }
  }

  return { isValid: true }
}

/**
 * Validates that a value is a valid array of strings
 */
export function validateStringArray(
  value: unknown,
  fieldName: string
): ValidationResult {
  if (value === undefined || value === null) {
    return { isValid: true } // Arrays are often optional
  }

  if (!Array.isArray(value)) {
    return {
      isValid: false,
      message: `${fieldName} phải là mảng.`,
    }
  }

  for (let i = 0; i < value.length; i++) {
    if (typeof value[i] !== "string") {
      return {
        isValid: false,
        message: `${fieldName} phải chứa các chuỗi ký tự.`,
      }
    }
  }

  return { isValid: true }
}

/**
 * Validates that a value is a valid tax percentage (0-100)
 */
export function validateTax(value: unknown): ValidationResult {
  const numberResult = validateNonNegativeNumber(value, "Thuế")
  if (!numberResult.isValid) {
    return numberResult
  }

  const numValue = Number(value)
  if (numValue > 100) {
    return {
      isValid: false,
      message: "Thuế không được vượt quá 100%.",
    }
  }

  return { isValid: true }
}

/**
 * Validates that a value is a valid date string
 */
export function validateDate(value: unknown, fieldName: string): ValidationResult {
  if (value === undefined || value === null || value === "") {
    return { isValid: true } // Date is often optional
  }

  if (typeof value !== "string") {
    return {
      isValid: false,
      message: `${fieldName} phải là chuỗi ký tự.`,
    }
  }

  const date = new Date(value)
  if (isNaN(date.getTime())) {
    return {
      isValid: false,
      message: `${fieldName} không hợp lệ.`,
    }
  }

  return { isValid: true }
}

/**
 * Helper function to validate multiple fields and return first error
 */
export function validateFields(
  validations: ValidationResult[]
): ValidationResult {
  for (const validation of validations) {
    if (!validation.isValid) {
      return validation
    }
  }
  return { isValid: true }
}