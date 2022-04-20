const axios = require('axios');

const response = await axios.put('http://localhost:28139/test/_security', {
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    auth: {
        username: 'admin',
        password: '123'
    },
    data: '{"admins":{"names":[], "roles":[]}, "readers":{"names":["joe"],"roles":[]}}'
});
