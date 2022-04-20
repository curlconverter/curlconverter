const axios = require('axios');

const response = await axios.get('localhost:28139/get', {
    headers: {
        'Content-Type': 'text/xml;charset=UTF-8',
        'getWorkOrderCancel': ''
    }
});
