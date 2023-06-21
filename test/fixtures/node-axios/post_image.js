import axios from 'axios';
import FormData from 'form-data';
import * as fs from 'fs';

const form = new FormData();
form.append('image', fs.readFileSync('image.jpg'), 'image.jpg');

const response = await axios.post(
  'http://localhost:28139/targetservice',
  form,
  {
    headers: {
      ...form.getHeaders()
    }
  }
);
