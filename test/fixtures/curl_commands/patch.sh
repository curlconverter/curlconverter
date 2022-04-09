# https://github.com/NickCarneiro/curlconverter/issues/68
curl 'http://localhost:28139/go/api/agents/adb9540a-b954-4571-9d9b-2f330739d4da' \
      -u 'username:password' \
      -H 'Accept: application/vnd.go.cd.v4+json' \
      -H 'Content-Type: application/json' \
      -X PATCH \
      -d '{
        "hostname": "agent02.example.com",
        "agent_config_state": "Enabled",
        "resources": ["Java","Linux"],
        "environments": ["Dev"]
        }'
