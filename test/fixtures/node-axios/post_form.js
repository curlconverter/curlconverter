import axios from 'axios';
import FormData from 'form-data';

const form = new FormData();
form.append('username', 'davidwalsh');
form.append('password', 'something');

const response = await axios.post(
  'http://localhost:28139/post-to-me.php',
  form,
  {
    headers: {
      ...form.getHeaders()
    }
  }
);
