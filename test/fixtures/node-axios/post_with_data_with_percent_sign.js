const axios = require('axios');

const response = await axios.post('https://localhost:28139/post', {
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: 'secret=*%5*!'
});
