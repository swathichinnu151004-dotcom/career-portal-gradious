/**
 * API base URL including `/api` (no trailing slash after "api").
 * Set REACT_APP_API_URL at build/start time to override (e.g. production API).
 */
export function getApiBaseUrl() {
  const fromEnv = process.env.REACT_APP_API_URL;
  if (fromEnv && String(fromEnv).trim() !== "") {
    return String(fromEnv).trim().replace(/\/$/, "");
  }
  return "http://localhost:5000/api";
}
