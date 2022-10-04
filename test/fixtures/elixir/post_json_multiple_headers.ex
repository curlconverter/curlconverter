response = HTTPoison.post!(
  "http://localhost:28139/rest/login-sessions",
  "{\"userName\":\"username123\",\"password\":\"password123\", \"authLoginDomain\":\"local\"}",
  [
    {"Content-Type", "application/json"},
    {"X-API-Version", "200"}
  ],
  [hackney: [:insecure]]
)
