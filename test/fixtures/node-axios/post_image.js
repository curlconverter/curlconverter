const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const form = new FormData();
form.append('image', fs.readFileSync('image.jpg'), 'image.jpg');

const response = await axios.post(
    'http://localhost:28139/targetservice',
    form,
    {
        headers: {
            ...form.getHeaders()
        }
    }
);
