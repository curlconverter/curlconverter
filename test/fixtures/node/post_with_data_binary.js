import fetch from 'node-fetch';

fetch('http://localhost:28139/post', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: '{"title":"china1"}'
});
