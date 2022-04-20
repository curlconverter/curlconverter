const axios = require('axios');

const response = await axios.post('http://localhost:28139/api/oauth/token/', {
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    auth: {
        username: 'foo',
        password: 'bar'
    },
    data: 'grant_type=client_credentials'
});
