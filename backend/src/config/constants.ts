/**
 * Application-wide constants
 * Centralized location for magic numbers and configuration values
 */

// ============================================================================
// OTP Configuration
// ============================================================================
export const OTP_CONFIG = {
  TTL_SECONDS: 600, // 10 minutes
  MAX_ATTEMPTS: 5,
  CODE_LENGTH: 6,
  MIN_CODE: 100000,
  MAX_CODE: 999999,
  KEY_PREFIX: 'otp:',
  KEY_DIGEST_LENGTH: 16,
  SECRET_MIN_LENGTH: 32,
} as const;

// ============================================================================
// JWT Configuration
// ============================================================================
export const JWT_CONFIG = {
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '30d',
  REFRESH_TOKEN_EXPIRY_MS: 30 * 24 * 60 * 60 * 1000,
  LEGACY_TOKEN_EXPIRY: '24h',
  REFERENCE_CODE_PREFIX: 'FIN-',
  REFERRAL_CODE_LENGTH: 6,
} as const;

// ============================================================================
// PAN Verification Configuration
// ============================================================================
export const PAN_CONFIG = {
  TOKEN_EXPIRY: '15m',
  PAN_REGEX: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  SECRET_MIN_LENGTH: 32,
} as const;

// ============================================================================
// Referral Configuration
// ============================================================================
export const REFERRAL_CONFIG = {
  CODE_PREFIX: 'FIN-',
  CODE_LENGTH: 6,
} as const;

// ============================================================================
// Cache Configuration
// ============================================================================
export const CACHE_CONFIG = {
  DEFAULT_TTL: 60, // 1 minute
  DEFAULT_PREFIX: 'cache:',
  TTL_PRESETS: {
    SHORT: 30,       // 30 seconds
    DEFAULT: 60,     // 1 minute
    MEDIUM: 300,     // 5 minutes
    LONG: 3600,      // 1 hour
    VERY_LONG: 86400, // 24 hours
  } as const,
} as const;

// ============================================================================
// Cache Key Prefixes
// ============================================================================
export const CACHE_PREFIXES = {
  DEFAULT: 'cache:',
  USER: 'user:',
  LEADS: 'leads:',
  ASSESSMENT: 'assess:',
  PORTFOLIO: 'portfolio:',
  SCORE: 'score:',
  FOLIO: 'folio:',
  EXISTING_CLIENTS: 'existing-clients:',
  USERS: 'users:',
  AMFI_SEARCH: 'amfi:search:',
  AMFI_NAV: 'amfi:nav:',
  AMFI_RETURN_1Y: 'amfi:return1y:',
  OTP: 'otp:',
} as const;

// ============================================================================
// Scoring Configuration
// ============================================================================
export const SCORING_CONFIG = {
  MAX_DIMENSION_SCORE: 20,
  MAX_TOTAL_SCORE: 100,
  DISPLAY_MIN: 2,
  DISPLAY_MAX: 97,

  // Goal Alignment
  GOAL_ALIGNMENT: {
    WEALTH_CREATION: { score: 30, multiplier: 1.0 },
    RETIREMENT: { score: 25, multiplier: 1.0 },
    CHILD_EDUCATION: { score: 25, multiplier: 1.0 },
    HOUSE_PURCHASE: { score: 25, multiplier: 1.0 },
    MARRIAGE: { score: 20, multiplier: 1.0 },
    TAX_SAVING: { score: 20, multiplier: 1.0 },
    PASSIVE_INCOME: { score: 25, multiplier: 1.0 },
    NOT_SURE_YET: { score: 15, multiplier: 1.0 },
  } as const,

  // Investment Tenure
  INVESTMENT_TENURE: {
    LESS_THAN_1_YEAR: 5,
    ONE_TO_3_YEARS: 10,
    THREE_TO_5_YEARS: 15,
    FIVE_TO_10_YEARS: 20,
    MORE_THAN_10_YEARS: 25,
  } as const,

  // Monthly Investment
  MONTHLY_INVESTMENT: {
    BELOW_1000: 500,
    RANGE_1000_2000: 1500,
    RANGE_2000_3000: 2000,
    RANGE_3000_5000: 4000,
    RANGE_5000_10000: 8000,
    ABOVE_10000: 15000,
  } as const,

  // Emergency Fund
  EMERGENCY_FUND: {
    NONE: 0,
    BELOW_30_DAYS: 500,
    DAYS_30_TO_90: 2000,
    DAYS_90_TO_180: 5000,
    DAYS_180_PLUS: 10000,
  } as const,

  // Age Ranges for Asset Allocation
  AGE_RANGES: {
    BELOW_30: { min: 70, max: 90, label: 'Below 30' },
    AGE_30_39: { min: 60, max: 80, label: '30-39' },
    AGE_40_49: { min: 50, max: 65, label: '40-49' },
    AGE_50_59: { min: 30, max: 50, label: '50-59' },
    AGE_60_PLUS: { min: 20, max: 40, label: '60+' },
  } as const,

  // Asset Allocation Thresholds
  ASSET_ALLOCATION: {
    DEVIATION_EXCELLENT: 5,
    DEVIATION_GOOD: 10,
    DEVIATION_FAIR: 20,
    MIN_EQUITY_PERCENT: 0.01,
    BALANCED_DEBT_EQUITY_RATIO: 0.4,
    BALANCED_DEBT_EQUITY_RATIO_MAX: 0.6,
  } as const,

  // Diversification
  DIVERSIFICATION: {
    MIN_FUNDS_FOR_DIVERSIFICATION: 3,
    MAX_FUNDS_FOR_DIVERSIFICATION: 10,
    MIN_AMC_COUNT: 2,
    MAX_SINGLE_FUND_ALLOCATION: 30,
    MAX_SINGLE_AMC_ALLOCATION: 40,
    CATEGORY_SPREAD_BONUS_MAX: 10,
  } as const,

  // Discipline
  DISCIPLINE: {
    BASE_SCORE: 20,
    MIN_SIP_RATIO: 0.5,
    MIN_SIP_AMOUNT: 500,
    SIP_RATIO_PENALTY: 5,
    LOW_SIP_AMOUNT_PENALTY: 3,
  } as const,

  // Efficiency
  EFFICIENCY: {
    BENCHMARK_RETURN_THRESHOLD: 12,
    MIN_TENURE_YEARS: 0.01,
    DAYS_IN_YEAR: 365.25,
    TIMEOUT_MS: 10000,
  } as const,

  // Discipline Scoring
  DISCIPLINE_SCORES: {
    MAX_SCORE: 20,
    MIN_SIP_RATIO: 0.5,
    SIP_RATIO_PENALTY: 5,
    MIN_SIP_AMOUNT: 500,
    LOW_SIP_PENALTY: 3,
  } as const,
} as const;

// ============================================================================
// AMFI Configuration
// ============================================================================
export const AMFI_DEFAULTS = {
  BASE_URL: 'https://api.mfapi.in/mf',
  SEARCH_LIMIT: 10,
  CACHE_TTL_SECONDS: 24 * 60 * 60, // 24 hours
} as const;

// ============================================================================
// Request/Response Limits
// ============================================================================
export const REQUEST_CONFIG = {
  JSON_BODY_LIMIT: '50kb',
  REQUEST_TIMEOUT_MS: 30000,
} as const;

// ============================================================================
// Rate Limiting Presets
// ============================================================================
export const RATE_LIMIT_PRESETS = {
  GLOBAL: { windowMs: 15 * 60 * 1000, max: 200 },
  OTP_SEND: { windowMs: 15 * 60 * 1000, max: 5 },
  PASSWORD_LOGIN: { windowMs: 15 * 60 * 1000, max: 10 },
  AUTH_GENERAL: { windowMs: 15 * 60 * 1000, max: 100 },
  CHAT: { windowMs: 15 * 60 * 1000, max: 30 },
} as const;

// ============================================================================
// Security Configuration
// ============================================================================
export const SECURITY_CONFIG = {
  BCRYPT_ROUNDS: 12,
  JWT_ACCESS_EXPIRY: '15m',
  JWT_REFRESH_EXPIRY: '30d',
  JWT_LEGACY_EXPIRY: '24h',
  PAN_VERIFICATION_TOKEN_EXPIRY: '15m',
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  BCRYPT_MIN_ROUNDS: 10,
  BCRYPT_MAX_ROUNDS: 15,
  REFERRAL_CODE_PREFIX: 'FIN-',
  REFERRAL_CODE_LENGTH: 6,
  PAN_REGEX: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  JWT_SECRET_MIN_LENGTH: 32,
  OTP_SECRET_MIN_LENGTH: 32,
  PAN_SECRET_MIN_LENGTH: 32,
} as const;



// ============================================================================
// File Upload Configuration
// ============================================================================
export const FILE_UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_MIME_TYPES: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'text/csv',
  ],
  ALLOWED_EXTENSIONS: ['.xlsx', '.xls', '.csv'],
} as const;