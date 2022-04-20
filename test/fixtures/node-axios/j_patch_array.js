const axios = require('axios');

const response = await axios.patch('http://localhost:28139/patch', {
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: 'item[]=1&item[]=2&item[]=3'
});
