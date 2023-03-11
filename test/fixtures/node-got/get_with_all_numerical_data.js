import got from 'got';

const response = await got.post('http://localhost:28139/CurlToNode', {
  headers: {
    'Accept': 'application/json'
  },
  json: 18233982904
});
