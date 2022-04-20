const axios = require('axios');

const formData = new FormData();
formData.append('from', 'test@tester.com');
formData.append('to', 'devs@tester.net');
formData.append('subject', 'Hello');
formData.append('text', 'Testing the converter!');

const response = await axios.post('http://localhost:28139/v3', {
    auth: {
        username: 'test'
    },
    data: formData
});
