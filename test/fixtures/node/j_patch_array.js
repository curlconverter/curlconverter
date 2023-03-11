import fetch from 'node-fetch';

fetch('http://localhost:28139/patch', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: 'item[]=1&item[]=2&item[]=3'
});
