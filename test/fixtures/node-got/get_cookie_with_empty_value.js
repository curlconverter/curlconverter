import got from 'got';

const response = await got('http://localhost:28139/cookies', {
  headers: {
    'accept': 'application/json',
    'Cookie': 'mysamplecookie=someValue; emptycookie=; otherCookie=2'
  }
});
