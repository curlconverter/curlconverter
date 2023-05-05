http -a username:password \
  PATCH \
  :28139/go/api/agents/adb9540a-b954-4571-9d9b-2f330739d4da \
  Accept:application/vnd.go.cd.v4+json \
  Content-Type:application/json \
  hostname=agent02.example.com \
  agent_config_state=Enabled \
  "resources[]"=Java \
  "resources[]"=Linux \
  "environments[]"=Dev
