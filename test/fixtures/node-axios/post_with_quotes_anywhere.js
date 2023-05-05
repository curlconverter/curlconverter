import axios from 'axios';

const response = await axios.post(
  'http://localhost:28139',
  'a=b&c="&d=\'',
  {
    headers: {
      'A': "''a'",
      'B': '"',
      'Cookie': 'x=1\'; y=2"',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    auth: {
      username: "ol'",
      password: 'asd"'
    }
  }
);
