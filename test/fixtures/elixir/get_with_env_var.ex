response = HTTPoison.get!(
  "http://localhost:28139/v2/images",
  [
    {"Content-Type", "application/json"},
    {"Authorization", "Bearer " <> System.get_env("DO_API_TOKEN", "")}
  ],
  [
    params: [
      {"type", "distribution"}
    ]
  ]
)
