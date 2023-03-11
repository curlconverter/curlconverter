fetch('http://localhost:28139/post', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: 'secret=*%5*!'
});
