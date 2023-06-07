import axios from 'axios';
import FormData from 'form-data';
import { fs } from 'fs';

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
