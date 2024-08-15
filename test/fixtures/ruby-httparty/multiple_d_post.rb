require 'httparty'

url = 'http://localhost:28139/webservices/rest.php'
headers = {
  'Content-Type': 'application/x-www-form-urlencoded',
}
body = 'version=1.2&auth_user=fdgxf&auth_pwd=oxfdscds&json_data={ "operation": "core/get", "class": "Software", "key": "key" }'
res = HTTParty.post(url, headers: headers, body: body)
