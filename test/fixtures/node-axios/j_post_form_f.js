const axios = require('axios');
const FormData = require('form-data');

const formData = new FormData();
formData.append('d1', 'data1');
formData.append('d2', 'data');

const response = await axios.post(
    'http://localhost:28139/post',
    formData,
    {
        headers: {
            ...formData.getHeaders()
        }
    }
);
