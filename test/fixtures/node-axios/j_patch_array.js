import axios from 'axios';

const response = await axios.patch(
  'http://localhost:28139/patch',
  'item[]=1&item[]=2&item[]=3',
  {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }
);
