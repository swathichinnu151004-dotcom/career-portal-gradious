export function getApiBaseUrl(endpoint = "") {
  const baseUrl = "https://gradious-career-portal-project-backend.onrender.com";

  if (!endpoint) {
    return `${baseUrl}/api`;
  }

  // If the endpoint already starts with /api or api, don't duplicate it
  if (endpoint.startsWith("/api") || endpoint.startsWith("api")) {
    return baseUrl;
  }

  // If the endpoint doesn't have /api, add it automatically
  return `${baseUrl}/api`;
}