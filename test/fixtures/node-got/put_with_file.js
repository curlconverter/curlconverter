import got from 'got';

const response = await got.put('http://localhost:28139/upload', {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: '@new_file'
});
