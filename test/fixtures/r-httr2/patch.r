library(httr2)

request("http://localhost:28139/go/api/agents/adb9540a-b954-4571-9d9b-2f330739d4da") |>
  req_method("PATCH") |>
  req_headers(Accept = "application/vnd.go.cd.v4+json") |>
  req_body_raw(
    '{\n        "hostname": "agent02.example.com",\n        "agent_config_state": "Enabled",\n        "resources": ["Java","Linux"],\n        "environments": ["Dev"]\n        }',
    type = "application/json"
  ) |>
  req_auth_basic("username", "password") |>
  req_perform()
