import axios from 'axios';

const response = await axios.post(
  'http://localhost:28139/post',
  'secret=*%5*!',
  {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }
);
