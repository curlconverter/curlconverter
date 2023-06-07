$.get('http://localhost:28139', {
  'foo': 'bar',
  'baz': 'qux'
})
  .done(function(response) {
    console.log(response);
  });
