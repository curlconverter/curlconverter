$.ajax({
  url: 'http://localhost:28139',
  crossDomain: true,
  data: {
    'key': ['one', 'two']
  },
  traditional: true
}).done(function(response) {
  console.log(response);
});
