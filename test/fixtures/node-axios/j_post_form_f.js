const axios = require('axios');
const FormData = require('form-data');

const form = new FormData();
form.append('d1', 'data1');
form.append('d2', 'data');

const response = await axios.post(
    'http://localhost:28139/post',
    form,
    {
        headers: {
            ...form.getHeaders()
        }
    }
);
