const axios = require('axios');

const response = await axios.post(
    'https://localhost:28139/rest/login-sessions',
    // '{"userName":"username123","password":"password123", "authLoginDomain":"local"}',
    JSON.stringify({
        'userName': 'username123',
        'password': 'password123',
        'authLoginDomain': 'local'
    }),
    {
        headers: {
            'Content-Type': 'application/json',
            'X-API-Version': '200'
        }
    }
);
