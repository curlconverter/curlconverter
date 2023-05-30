import axios from 'axios';

const response = await axios.post(
  'http://localhost:28139/endpoint',
  '',
  {
    headers: {
      'Content-Type': 'application/json',
      'key': 'abcdefg'
    }
  }
);
