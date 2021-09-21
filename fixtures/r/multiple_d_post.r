require(httr)

data = list(
  `version` = '1.2',
  `auth_user` = 'fdgxf',
  `auth_pwd` = 'oxfdscds',
  `json_data` = '{ "operation": "core/get", "class": "Software", "key": "key" }'
)

res <- httr::POST(url = 'https://cmdb.litop.local/webservices/rest.php', body = data)
