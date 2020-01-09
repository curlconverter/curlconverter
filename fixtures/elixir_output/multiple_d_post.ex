request = %HTTPoison.Request{
  method: :post,
  url: "https://cmdb.litop.local/webservices/rest.php",
  options: [],
  headers: [],
  params: [],
  body: [
    {~s|version|, ~s|1.2|},
    {~s|auth_user|, ~s|fdgxf|},
    {~s|auth_pwd|, ~s|oxfdscds|},
    {~s|json_data|, ~s|{ "operation": "core/get", "class": "Software", "key": "key" }|}
  ]
}

response = HTTPoison.request(request)
