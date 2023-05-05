import axios from 'axios';

const response = await axios.put(
  'http://localhost:28139/test/_security',
  '{"admins":{"names":[], "roles":[]}, "readers":{"names":["joe"],"roles":[]}}',
  {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    auth: {
      username: 'admin',
      password: '123'
    }
  }
);
