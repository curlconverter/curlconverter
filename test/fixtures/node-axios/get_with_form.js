import axios from 'axios';
import FormData from 'form-data';

const form = new FormData();
form.append('from', 'test@tester.com');
form.append('to', 'devs@tester.net');
form.append('subject', 'Hello');
form.append('text', 'Testing the converter!');

const response = await axios.post(
  'http://localhost:28139/v3',
  form,
  {
    headers: {
      ...form.getHeaders()
    },
    auth: {
      username: 'test'
    }
  }
);
