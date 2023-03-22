wget --method=PATCH \
  --header="Accept: application/vnd.go.cd.v4+json" \
  --header="Content-Type: application/json" \
  --user=username \
  --password=password \
  --auth-no-challenge \
  --body-data=$'{\n        "hostname": "agent02.example.com",\n        "agent_config_state": "Enabled",\n        "resources": ["Java","Linux"],\n        "environments": ["Dev"]\n        }' \
  --output-document - \
  http://localhost:28139/go/api/agents/adb9540a-b954-4571-9d9b-2f330739d4da
