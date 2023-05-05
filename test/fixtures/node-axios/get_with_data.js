import axios from 'axios';

const response = await axios.get('http://localhost:28139/synthetics/api/v3/monitors', {
  params: {
    'test': '2',
    'limit': '100',
    'w': '4'
  },
  headers: {
    'X-Api-Key': '123456789'
  }
});
