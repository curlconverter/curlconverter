fetch('http://localhost:28139/webservices/rest.php', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: 'version=1.2&auth_user=fdgxf&auth_pwd=oxfdscds&json_data={ "operation": "core/get", "class": "Software", "key": "key" }'
});
