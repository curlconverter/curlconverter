import got from 'got';

const response = await got.post('http://localhost:28139/american-art/query', {
  headers: {
    'Content-type': 'application/sparql-query',
    'Accept': 'application/sparql-results+json'
  },
  body: '@./sample.sparql'
});
