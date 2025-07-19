/**
 * Security utilities for input validation and sanitization
 */

// Remove potentially dangerous characters and patterns
export const sanitizeInput = (input: string): string => {
  if (typeof input !== "string") return "";

  return (
    input
      .trim()
      // Remove script tags and event handlers
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/on\w+\s*=/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/vbscript:/gi, "")
      .replace(/data:/gi, "")
      // Remove other potentially dangerous patterns
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "")
  );
};

// Validate input length and content
export const validateInput = (
  input: string,
  maxLength: number,
  minLength: number = 1
): boolean => {
  if (!input || typeof input !== "string") return false;

  const sanitized = sanitizeInput(input);
  return sanitized.length >= minLength && sanitized.length <= maxLength;
};

// Rate limiting helper (client-side, but more secure)
export const getRateLimitKey = (): string => {
  const today = new Date().toDateString();
  return `rate_limit_${today}`;
};

// Check if user is likely a bot
export const detectBot = (userAgent: string): boolean => {
  const botPatterns = [
    "bot",
    "crawler",
    "spider",
    "scraper",
    "curl",
    "wget",
    "python",
    "java",
    "phantomjs",
    "headless",
    "selenium",
    "webdriver",
  ];

  const lowerUA = userAgent.toLowerCase();
  return botPatterns.some((pattern) => lowerUA.includes(pattern));
};

// Validate debate type
export const isValidDebateType = (type: string): boolean => {
  const validTypes = [
    "couple",
    "friends",
    "mom_and_child",
    "siblings",
    "co_workers",
    "boss_and_employee",
  ];
  return validTypes.includes(type);
};
