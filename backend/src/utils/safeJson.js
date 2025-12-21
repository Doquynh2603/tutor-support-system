function safeJsonParse(json) {
  try {
    return json ? JSON.parse(json) : {};
  } catch {
    return {};
  }
}
module.exports = { safeJsonParse };
