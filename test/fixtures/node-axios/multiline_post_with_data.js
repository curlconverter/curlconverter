const axios = require('axios');

const response = await axios.get('http://localhost:28139/echo/html/', {
    headers: {
        'Origin': 'http://fiddle.jshell.net',
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: {
        'msg1': 'value1',
        'msg2': 'value2'
    }
});
