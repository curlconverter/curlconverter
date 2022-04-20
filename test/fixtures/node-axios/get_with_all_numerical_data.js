const axios = require('axios');

const response = await axios.post('http://localhost:28139/CurlToNode', {
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    data: JSON.stringify(18233982904)
});
