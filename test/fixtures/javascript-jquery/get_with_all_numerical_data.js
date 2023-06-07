$.ajax({
  url: 'http://localhost:28139/CurlToNode',
  crossDomain: true,
  method: 'post',
  headers: {
    'Accept': 'application/json'
  },
  contentType: 'application/json',
  data: '18233982904'
}).done(function(response) {
  console.log(response);
});
