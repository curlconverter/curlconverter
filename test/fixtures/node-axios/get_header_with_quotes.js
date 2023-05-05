import axios from 'axios';

const response = await axios.get('http://localhost:28139', {
  headers: {
    'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="92"'
  }
});
