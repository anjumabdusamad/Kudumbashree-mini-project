/**
 * Common Validation Utilities for Kudumbashree Frontend Forms
 */

// Validate email format
export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return 'Email address is required';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address (e.g., user@example.com)';
  }
  return null;
};

// Validate 10-digit Indian mobile number
export const validatePhone = (phone) => {
  if (!phone || !phone.trim()) {
    return 'Phone number is required';
  }
  const cleanPhone = phone.trim().replace(/\D/g, '');
  if (cleanPhone.length !== 10) {
    return 'Phone number must be exactly 10 digits';
  }
  if (!/^[6-9]/.test(cleanPhone)) {
    return 'Phone number must start with 6, 7, 8, or 9';
  }
  return null;
};

// Validate password
export const validatePassword = (password, minLength = 6) => {
  if (!password || !password.trim()) {
    return 'Password is required';
  }
  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters long`;
  }
  return null;
};

// Validate required text field with min length
export const validateRequiredText = (text, fieldName = 'Field', minLength = 2, maxLength = 200) => {
  if (!text || !text.trim()) {
    return `${fieldName} is required`;
  }
  const trimmed = text.trim();
  if (trimmed.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters long`;
  }
  if (trimmed.length > maxLength) {
    return `${fieldName} cannot exceed ${maxLength} characters`;
  }
  return null;
};

// Validate numeric fields (price, stock, amount, etc.)
export const validateNumber = (val, fieldName = 'Value', min = 1, max = Infinity, isInteger = false) => {
  if (val === '' || val === null || val === undefined) {
    return `${fieldName} is required`;
  }
  const num = Number(val);
  if (isNaN(num)) {
    return `${fieldName} must be a valid number`;
  }
  if (isInteger && !Number.isInteger(num)) {
    return `${fieldName} must be a whole number`;
  }
  if (num < min) {
    return `${fieldName} must be at least ${min}`;
  }
  if (num > max) {
    return `${fieldName} cannot exceed ${max}`;
  }
  return null;
};

// Validate alphanumeric codes (e.g. NHG code)
export const validateCode = (code, fieldName = 'Code', minLength = 2, maxLength = 15) => {
  if (!code || !code.trim()) {
    return `${fieldName} is required`;
  }
  const trimmed = code.trim().toUpperCase();
  if (trimmed.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  if (trimmed.length > maxLength) {
    return `${fieldName} cannot exceed ${maxLength} characters`;
  }
  if (!/^[A-Z0-9_-]+$/.test(trimmed)) {
    return `${fieldName} can only contain letters, numbers, hyphens, and underscores`;
  }
  return null;
};

// Validate delivery address
export const validateAddress = (address) => {
  if (!address || !address.trim()) {
    return 'Delivery address is required';
  }
  if (address.trim().length < 10) {
    return 'Please provide a complete address (minimum 10 characters with house/street details)';
  }
  return null;
};
