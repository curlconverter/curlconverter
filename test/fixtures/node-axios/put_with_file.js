import axios from 'axios';

const response = await axios.put(
  'http://localhost:28139/upload',
  '@new_file',
  {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }
);
