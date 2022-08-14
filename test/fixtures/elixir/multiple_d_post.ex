request = %HTTPoison.Request{
  method: :post,
  url: "http://localhost:28139/webservices/rest.php",
  options: [],
  headers: [
    {~s|Content-Type|, ~s|application/x-www-form-urlencoded|},
  ],
  params: [],
  body: [
    {~s|version|, ~s|1.2|},
    {~s|auth_user|, ~s|fdgxf|},
    {~s|auth_pwd|, ~s|oxfdscds|},
    {~s|json_data|, ~s|{ "operation": "core/get", "class": "Software", "key": "key" }|}
  ]
}

response = HTTPoison.request(request)
