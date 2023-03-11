import got from 'got';

const response = await got.post('http://localhost:28139/rest/login-sessions', {
  headers: {
    'Content-Type': 'application/json',
    'X-API-Version': '200'
  },
  // body: '{"userName":"username123","password":"password123", "authLoginDomain":"local"}',
  json: {
    'userName': 'username123',
    'password': 'password123',
    'authLoginDomain': 'local'
  },
  https: {
    rejectUnauthorized: false
  }
});
