import got from 'got';

const response = await got.patch('http://localhost:28139/patch', {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: 'item[]=1&item[]=2&item[]=3'
});
