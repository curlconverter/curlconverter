import axios from 'axios';

const response = await axios.get('http://localhost:28139/', {
  headers: {
    'foo': 'bar'
  }
});
