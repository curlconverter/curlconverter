const axios = require('axios');
const fs = require('fs');

const formData = new FormData();
formData.append('file1', fs.readFileSync('./fixtures/curl_commands/delete.sh'), './fixtures/curl_commands/delete.sh');
formData.append('form1', 'form+data+1');
formData.append('form2', 'form_data_2');

const response = await axios.patch('http://localhost:28139/patch', {
    data: formData
});
