$.ajax({
  url: 'http://localhost:28139/synthetics/api/v3/monitors',
  crossDomain: true,
  headers: {
    'X-Api-Key': '123456789'
  },
  data: {
    'test': '2',
    'limit': '100',
    'w': '4'
  }
}).done(function(response) {
  console.log(response);
});
