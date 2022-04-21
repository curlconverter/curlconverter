const axios = require('axios');
const FormData = require('form-data');

const form = new FormData();
form.append('username', 'davidwalsh');
form.append('password', 'something');

const response = await axios.post(
    'http://localhost:28139/post-to-me.php',
    form,
    {
        headers: {
            ...form.getHeaders()
        }
    }
);
