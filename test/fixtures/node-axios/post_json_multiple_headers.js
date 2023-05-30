import axios from 'axios';

const response = await axios.post(
  'http://localhost:28139/rest/login-sessions',
  // '{"userName":"username123","password":"password123", "authLoginDomain":"local"}',
  {
    'userName': 'username123',
    'password': 'password123',
    'authLoginDomain': 'local'
  },
  {
    headers: {
      'Content-Type': 'application/json',
      'X-API-Version': '200'
    }
  }
);
