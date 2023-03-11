fetch('http://localhost:28139/', {
  method: 'POST',
  body: new URLSearchParams([
    ['foo', 'bar'],
    ['foo', ''],
    ['foo', 'barbar']
  ])
});
