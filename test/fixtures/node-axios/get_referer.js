import axios from 'axios';

const response = await axios.get('http://localhost:28139', {
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'User-Agent': 'SimCity',
    'Referer': 'https://website.com'
  }
});
