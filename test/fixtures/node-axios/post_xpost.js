import axios from 'axios';

const response = await axios.post(
  'http://localhost:28139/api/xxxxxxxxxxxxxxxx',
  '{"keywords":"php","page":1,"searchMode":1}',
  {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }
);
