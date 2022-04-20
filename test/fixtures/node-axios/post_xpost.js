const axios = require('axios');

const response = await axios.post('http://localhost:28139/api/xxxxxxxxxxxxxxxx', {
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: '{"keywords":"php","page":1,"searchMode":1}'
});
