$.ajax({
  url: 'http://localhost:28139/v2/images',
  crossDomain: true,
  headers: {
    'Authorization': 'Bearer ' + process.env['DO_API_TOKEN']
  },
  contentType: 'application/json',
  data: {
    'type': 'distribution'
  }
}).done(function(response) {
  console.log(response);
});
