const axios = require('axios');

const response = await axios.request('localhost:28139', {
    method: 'what'
});
