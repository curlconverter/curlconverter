const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const formData = new FormData();
formData.append('file1', fs.readFileSync('./fixtures/curl_commands/delete.sh'), './fixtures/curl_commands/delete.sh');

const response = await axios.patch('http://localhost:28139/patch', {
    data: formData
});
