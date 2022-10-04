response = HTTPoison.get!(
  "http://localhost:28139",
  [],
  [hackney: [:insecure]]
)
