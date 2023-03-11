fetch('http://localhost:28139', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: new ArrayBuffer('foo&', new File([/* contents */], '$FILENAME'))
});
