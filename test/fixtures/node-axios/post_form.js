const axios = require('axios');
const FormData = require('form-data');

const formData = new FormData();
formData.append('username', 'davidwalsh');
formData.append('password', 'something');

const response = await axios.post('http://localhost:28139/post-to-me.php', {
    data: formData
});
