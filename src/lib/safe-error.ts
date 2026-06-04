const SECRET_PATTERNS = [
  /\bsk-[A-Za-z0-9_-]{8,}\b/g,
  /\bhf_[A-Za-z0-9]{8,}\b/g,
  /\bgh[pousr]_[A-Za-z0-9_]{8,}\b/g,
  /\bAIza[A-Za-z0-9_-]{8,}\b/g,
  /\b(?:api[_-]?key|secret|token|password)\b\s*[:=]\s*[A-Za-z0-9_./+=-]{12,}/gi,
];

const LOCAL_PATH_PATTERNS = [/\/(?:Users|private|var|tmp)\/[^\s)"']+/g, /[A-Za-z]:\\[^\s)"']+/g];

const SAFE_SERVER_ERROR_MESSAGES = new Set([
  "AI gateway is not configured",
  "Failed to generate explanation",
  "Failed to parse AI response",
  "Generated explanation was incomplete. Please try again.",
  "Invalid JSON body",
  "Method not allowed",
  "Rate limit exceeded. Please try again in a moment.",
  "Topic is required",
  "Usage limit reached. Please add credits to continue.",
]);

export function redactSensitiveText(value: string): string {
  return [...SECRET_PATTERNS, ...LOCAL_PATH_PATTERNS].reduce(
    (message, pattern) => message.replace(pattern, "[redacted]"),
    value,
  );
}

export function safeServerErrorMessage(message: unknown): string {
  if (typeof message !== "string" || !message.trim()) {
    return "Failed to generate explanation";
  }

  const trimmed = message.trim();
  if (SAFE_SERVER_ERROR_MESSAGES.has(trimmed) || /^Topic must be \d+ characters or fewer$/.test(trimmed)) {
    return trimmed;
  }

  return redactSensitiveText(trimmed);
}

export function safeErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (error instanceof Error && error.message.trim()) {
    return safeServerErrorMessage(error.message);
  }
  return fallback;
}

export function safeLogDetails(error: unknown) {
  return {
    name: error instanceof Error ? error.name : typeof error,
  };
}
