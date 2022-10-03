response = HTTPoison.patch! "http://localhost:28139/go/api/agents/adb9540a-b954-4571-9d9b-2f330739d4da",
  "{\n        \"hostname\": \"agent02.example.com\",\n        \"agent_config_state\": \"Enabled\",\n        \"resources\": [\"Java\",\"Linux\"],\n        \"environments\": [\"Dev\"]\n        }",
  [
    {"Accept", "application/vnd.go.cd.v4+json"},
    {"Content-Type", "application/json"}
  ],
  [hackney: [basic_auth: {"username", "password"}]]
