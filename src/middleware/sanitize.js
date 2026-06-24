function sanitizeString(value) {
  if (typeof value !== "string") return value;
  return value.trim();
}

function sanitizeObj(obj) {
  if (!obj || typeof obj !== "object") return obj;
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = value.trim();
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((v) => (typeof v === "string" ? v.trim() : v));
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export function sanitizeBody(req, res, next) {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeObj(req.body);
  }
  next();
}
