import fetch, { FormData, fileFromSync } from 'node-fetch';

const form = new FormData();
form.append('files', fileFromSync('47.htz'));
form.append('name', '47');
form.append('oldMediaId', '47');
form.append('updateInLayouts', '1');
form.append('deleteOldRevisions', '1');

fetch('http://localhost:28139/api/library', {
  method: 'POST',
  headers: {
    'accept': 'application/json',
    'Content-Type': 'multipart/form-data'
  },
  body: form
});
