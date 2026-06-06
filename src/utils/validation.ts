import * as yup from 'yup';

// User validation schemas
export const signupSchema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email address')
    .max(100, 'Email too long'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
  fullName: yup
    .string()
    .required('Full name is required')
    .min(2, 'Name too short')
    .max(100, 'Name too long'),
  phone: yup
    .string()
    .required('Phone number is required')
    .min(10, 'Phone number too short')
    .max(15, 'Phone number too long'),
});

// Strict password schema for production (optional - can be enabled later)
export const strictPasswordSchema = yup.object({
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

export const loginSchema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email address'),
  password: yup
    .string()
    .required('Password is required'),
});

// Property validation schemas
export const propertySchema = yup.object({
  title: yup
    .string()
    .required('Title is required')
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title too long'),
  description: yup
    .string()
    .max(2000, 'Description too long'),
  price: yup
    .number()
    .required('Price is required')
    .positive('Price must be positive')
    .max(10000000000, 'Price too high')
    .typeError('Price must be a number'),
  bedrooms: yup
    .number()
    .required('Bedrooms is required')
    .min(0, 'Bedrooms cannot be negative')
    .max(20, 'Too many bedrooms')
    .integer('Bedrooms must be a whole number')
    .typeError('Bedrooms must be a number'),
  bathrooms: yup
    .number()
    .required('Bathrooms is required')
    .min(0, 'Bathrooms cannot be negative')
    .max(20, 'Too many bathrooms')
    .integer('Bathrooms must be a whole number')
    .typeError('Bathrooms must be a number'),
  areaSqft: yup
    .number()
    .required('Area is required')
    .positive('Area must be positive')
    .max(1000000, 'Area too large')
    .typeError('Area must be a number'),
  city: yup
    .string()
    .required('City is required')
    .min(2, 'City name too short')
    .max(100, 'City name too long')
    .matches(/^[a-zA-Z\s]+$/, 'City name can only contain letters and spaces'),
  sector: yup
    .string()
    .max(100, 'Sector name too long'),
  pincode: yup
    .string()
    .required('Pincode is required')
    .matches(/^\d{6}$/, 'Pincode must be 6 digits'),
  address: yup
    .string()
    .required('Address is required')
    .min(5, 'Address too short')
    .max(500, 'Address too long'),
  ownerPhone: yup
    .string()
    .required('Phone number is required')
    .matches(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number format'),
  imageUrl: yup
    .string()
    .url('Invalid URL format')
    .nullable(),
});

// Inquiry validation schema
export const inquirySchema = yup.object({
  message: yup
    .string()
    .required('Message is required')
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message too long'),
  userName: yup
    .string()
    .required('Name is required')
    .min(2, 'Name too short')
    .max(100, 'Name too long'),
  userEmail: yup
    .string()
    .required('Email is required')
    .email('Invalid email address'),
  userPhone: yup
    .string()
    .nullable()
    .matches(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number format'),
});

// Helper function to sanitize user input
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  // Remove potential XSS characters
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

// Helper function to sanitize HTML content
export const sanitizeHtml = (html: string): string => {
  if (!html) return '';
  
  // Basic HTML sanitization - remove script tags and dangerous attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '')
    .trim();
};

// Validate and sanitize property data
export const validateAndSanitizeProperty = async (data: any) => {
  // Validate
  await propertySchema.validate(data, { abortEarly: false });
  
  // Sanitize
  return {
    ...data,
    title: sanitizeInput(data.title),
    description: sanitizeInput(data.description),
    city: sanitizeInput(data.city),
    sector: sanitizeInput(data.sector || ''),
    address: sanitizeInput(data.address),
    ownerPhone: sanitizeInput(data.ownerPhone),
  };
};

// Validate and sanitize inquiry data
export const validateAndSanitizeInquiry = async (data: any) => {
  // Validate
  await inquirySchema.validate(data, { abortEarly: false });
  
  // Sanitize
  return {
    ...data,
    message: sanitizeInput(data.message),
    userName: sanitizeInput(data.userName),
    userEmail: sanitizeInput(data.userEmail),
    userPhone: data.userPhone ? sanitizeInput(data.userPhone) : undefined,
  };
};

// Validate and sanitize user signup data
export const validateAndSanitizeSignup = async (data: any) => {
  // Validate
  await signupSchema.validate(data, { abortEarly: false });
  
  // Sanitize
  return {
    ...data,
    email: sanitizeInput(data.email).toLowerCase(),
    fullName: sanitizeInput(data.fullName),
    phone: data.phone ? sanitizeInput(data.phone) : undefined,
  };
};

// Validate login data
export const validateLogin = async (data: any) => {
  await loginSchema.validate(data, { abortEarly: false });
  
  return {
    ...data,
    email: sanitizeInput(data.email).toLowerCase(),
  };
};

// Format validation errors for display
export const formatValidationErrors = (error: yup.ValidationError): string => {
  if (error.inner && error.inner.length > 0) {
    return error.inner.map(err => err.message).join('\n');
  }
  return error.message;
};

// Made with Bob
