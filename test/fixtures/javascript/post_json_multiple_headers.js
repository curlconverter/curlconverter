fetch('http://localhost:28139/rest/login-sessions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Version': '200'
  },
  // body: '{"userName":"username123","password":"password123", "authLoginDomain":"local"}',
  body: JSON.stringify({
    'userName': 'username123',
    'password': 'password123',
    'authLoginDomain': 'local'
  })
});
