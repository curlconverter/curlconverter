const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const form = new FormData();
form.append('attributes', '{"name":"tigers.jpeg", "parent":{"id":"11446498"}}');
form.append('file', fs.readFileSync('myfile.jpg'), 'myfile.jpg');

const response = await axios.post(
    'http://localhost:28139/api/2.0/files/content',
    form,
    {
        headers: {
            ...form.getHeaders(),
            'Authorization': 'Bearer ACCESS_TOKEN',
            'X-Nice': 'Header'
        }
    }
);
