import got from 'got';

const response = await got.put('http://localhost:28139/twitter/_mapping/user?pretty', {
  headers: {
    'Content-Type': 'application/json'
  },
  // body: '{"properties": {"email": {"type": "keyword"}}}',
  json: {
    'properties': {
      'email': {
        'type': 'keyword'
      }
    }
  }
});
