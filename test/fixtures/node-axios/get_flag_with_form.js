import axios from 'axios';
import FormData from 'form-data';

const form = new FormData();
form.append('name', 'value');

const response = await axios.post(
  'http://localhost:28139/upload',
  form,
  {
    headers: {
      ...form.getHeaders()
    }
  }
);
