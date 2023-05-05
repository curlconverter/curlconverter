import axios from 'axios';

const response = await axios.get('http://localhost:28139/v2/images', {
  params: {
    'type': 'distribution'
  },
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + process.env['DO_API_TOKEN']
  }
});
