method = :post
url = "https://cmdb.litop.local/webservices/rest.php"
headers = []
body = [
  {~s|version|, ~s|1.2|},
  {~s|auth_user|, ~s|fdgxf|},
  {~s|auth_pwd|, ~s|oxfdscds|},
  {~s|json_data|, ~s|{ "operation": "core/get", "class": "Software", "key": "key" }|}
]
options = []
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
