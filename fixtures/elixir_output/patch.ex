method = :patch
url = "https://ci.example.com/go/api/agents/adb9540a-b954-4571-9d9b-2f330739d4da"
headers = [
  {~s|Accept|, ~s|application/vnd.go.cd.v4+json|},
  {~s|Content-Type|, ~s|application/json|},
]
body = ~s|{
        "hostname": "agent02.example.com",
        "agent_config_state": "Enabled",
        "resources": ["Java","Linux"],
        "environments": ["Dev"]
        }|
options = [hackney: [basic_auth: {~s|username|, ~s|password|}]]
params = []

request = %HTTPoison.Request{
  method: method,
  url: url,
  body: body,
  headers: headers,
  options: options,
  params: params,
}

response = HTTPoison.request(request)
