export function safeJsonParse<T = any>(
  json: string | null | undefined
): T | {} {
  try {
    return json ? JSON.parse(json) : {};
  } catch {
    return {};
  }
}
