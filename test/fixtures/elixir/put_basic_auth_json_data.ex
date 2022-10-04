response = HTTPoison.put!(
  "http://localhost:28139/test/_security",
  "{\"admins\":{\"names\":[], \"roles\":[]}, \"readers\":{\"names\":[\"joe\"],\"roles\":[]}}",
  [
    {"Content-Type", "application/x-www-form-urlencoded"}
  ],
  [hackney: [basic_auth: {"admin", "123"}]]
)
