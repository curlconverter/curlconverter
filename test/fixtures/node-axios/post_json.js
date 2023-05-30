import axios from 'axios';

const response = await axios.post(
  'http://localhost:28139',
  // '{ "drink": "coffe" }',
  {
    'drink': 'coffe'
  },
  {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }
);
