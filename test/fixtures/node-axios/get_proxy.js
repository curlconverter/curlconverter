import axios from 'axios';

const response = await axios.get('http://localhost:28139', {
  proxy: {
    protocol: 'http',
    host: 'localhost',
    port: 8080
  }
});
