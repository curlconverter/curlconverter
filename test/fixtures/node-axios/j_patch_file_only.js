const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const form = new FormData();
form.append('file1', fs.readFileSync('./test/fixtures/curl_commands/delete.sh'), './test/fixtures/curl_commands/delete.sh');

const response = await axios.patch(
  'http://localhost:28139/patch',
  form,
  {
    headers: {
      ...form.getHeaders()
    }
  }
);
