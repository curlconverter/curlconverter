import fetch, { FormData, fileFromSync } from 'node-fetch';

const form = new FormData();
form.append('file1', fileFromSync('./test/fixtures/curl_commands/delete.sh'));

fetch('http://localhost:28139/patch', {
  method: 'PATCH',
  body: form
});
