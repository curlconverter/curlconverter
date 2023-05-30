import axios from 'axios';

const response = await axios.put(
  'http://localhost:28139/twitter/_mapping/user?pretty',
  // '{"properties": {"email": {"type": "keyword"}}}',
  {
    'properties': {
      'email': {
        'type': 'keyword'
      }
    }
  },
  {
    headers: {
      'Content-Type': 'application/json'
    }
  }
);
