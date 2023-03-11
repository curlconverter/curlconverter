import got from 'got';
import * as fs from 'fs';

const form = new FormData();
form.append('file1', fs.readFileSync('./test/fixtures/curl_commands/delete.sh'), './test/fixtures/curl_commands/delete.sh');
form.append('form1', 'form+data+1');
form.append('form2', 'form_data_2');

const response = await got.patch('http://localhost:28139/patch', {
  body: form
});
