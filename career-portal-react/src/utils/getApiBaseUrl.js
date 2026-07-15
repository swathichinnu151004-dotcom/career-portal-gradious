/**
 * API base URL including `/api` (no trailing slash after "api").
 * Use as `${getApiBaseUrl}/jobs/...` — this is a string, not a function.
 */
function resolveApiBaseUrl() {
  const fromEnv = process.env.REACT_APP_API_URL;
  if (fromEnv && String(fromEnv).trim() !== "") {
    return String(fromEnv).trim().replace(/\/$/, "");
  }
  return "http://localhost:5000/api";
}

export const getApiBaseUrl = resolveApiBaseUrl();
