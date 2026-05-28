export function getApiBaseUrl(endpoint = "") {
  const baseUrl = "https://gradious-career-portal-project-backend.onrender.com";

  if (!endpoint) {
    return `${baseUrl}/api`;
  }

  if (endpoint.startsWith("/api") || endpoint.startsWith("api")) {
    return baseUrl;
  }

  return `${baseUrl}/api`;
}