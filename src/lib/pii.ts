/**
 * Simple PII Redaction Layer
 * Strips emails, phone numbers, and common patterns before sending to AI.
 */

export function redactPII(text: string): string {
  let redacted = text;

  // Email regex
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  redacted = redacted.replace(emailRegex, "[EMAIL]");

  // Phone number regex (basic)
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  redacted = redacted.replace(phoneRegex, "[PHONE]");

  // Social Security / ID patterns (example)
  const ssnRegex = /\b\d{3}-\d{2}-\d{4}\b/g;
  redacted = redacted.replace(ssnRegex, "[ID]");

  return redacted;
}
