const axios = require('axios');

const response = await axios.post('http://localhost:28139/post', {
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: 'data1=data1&data2=data2&data3=data3'
});
