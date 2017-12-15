import requests

data = [
  ('version', '1.2'),
  ('auth_user', 'fdgxf'),
  ('auth_pwd', 'oxfdscds'),
  ('json_data', '{ "operation": "core/get", "class": "Software", "key": "key" }'),
]

response = requests.post('https://cmdb.litop.local/webservices/rest.php', data=data)
