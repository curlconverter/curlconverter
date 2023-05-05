import axios from 'axios';

const response = await axios.get('http://localhost:28139/cookies', {
  headers: {
    'accept': 'application/json',
    'Cookie': 'mysamplecookie=someValue; emptycookie=; otherCookie=2'
  }
});
