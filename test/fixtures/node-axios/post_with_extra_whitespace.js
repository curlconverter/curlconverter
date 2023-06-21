import axios from 'axios';
import FormData from 'form-data';
import * as fs from 'fs';

const form = new FormData();
form.append('files', fs.readFileSync('47.htz'), '47.htz');
form.append('name', '47');
form.append('oldMediaId', '47');
form.append('updateInLayouts', '1');
form.append('deleteOldRevisions', '1');

const response = await axios.post(
  'http://localhost:28139/api/library',
  form,
  {
    headers: {
      ...form.getHeaders(),
      'accept': 'application/json',
      'Content-Type': 'multipart/form-data'
    }
  }
);
