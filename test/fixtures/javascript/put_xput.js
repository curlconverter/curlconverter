fetch('http://localhost:28139/twitter/_mapping/user?pretty', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  // body: '{"properties": {"email": {"type": "keyword"}}}',
  body: JSON.stringify({
    'properties': {
      'email': {
        'type': 'keyword'
      }
    }
  })
});
