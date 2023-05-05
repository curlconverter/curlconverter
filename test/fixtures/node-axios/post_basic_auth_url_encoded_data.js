import axios from 'axios';

const response = await axios.post(
  'http://localhost:28139/api/oauth/token/',
  new URLSearchParams({
    'grant_type': 'client_credentials'
  }),
  {
    auth: {
      username: 'foo',
      password: 'bar'
    }
  }
);
