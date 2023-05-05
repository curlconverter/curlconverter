import axios from 'axios';

const response = await axios.get('http://localhost:28139/api/retail/books/list', {
  headers: {
    'Accept': 'application/json',
    'user-token': '75d7ce4350c7d6239347bf23d3a3e668'
  }
});
