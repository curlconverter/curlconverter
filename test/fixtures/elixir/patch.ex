request = %HTTPoison.Request{
  method: :patch,
  url: "http://localhost:28139/go/api/agents/adb9540a-b954-4571-9d9b-2f330739d4da",
  options: [hackney: [basic_auth: {~s|username|, ~s|password|}]],
  headers: [
    {~s|Accept|, ~s|application/vnd.go.cd.v4+json|},
    {~s|Content-Type|, ~s|application/json|},
  ],
  params: [],
  body: ~s|{
        "hostname": "agent02.example.com",
        "agent_config_state": "Enabled",
        "resources": ["Java","Linux"],
        "environments": ["Dev"]
        }|
}

response = HTTPoison.request(request)
