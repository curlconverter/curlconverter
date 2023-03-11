fetch('http://localhost:28139/post', {
  method: 'POST',
  body: new URLSearchParams({
    'data1': 'data1',
    'data2': 'data2',
    'data3': 'data3'
  })
});
