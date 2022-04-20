const axios = require('axios');

const response = await axios.post('https://localhost:28139/rest/login-sessions', {
    headers: {
        'Content-Type': 'application/json',
        'X-API-Version': '200'
    },
    data: '{"userName":"username123","password":"password123", "authLoginDomain":"local"}'
});
