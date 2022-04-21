const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const form = new FormData();
form.append('file1', fs.readFileSync('./fixtures/curl_commands/delete.sh'), './fixtures/curl_commands/delete.sh');
form.append('form1', 'form+data+1');
form.append('form2', 'form_data_2');

const response = await axios.patch(
    'http://localhost:28139/patch',
    form,
    {
        headers: {
            ...form.getHeaders()
        }
    }
);
