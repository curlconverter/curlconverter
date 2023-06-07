$.ajax({
  url: 'http://localhost:28139',
  crossDomain: true,
  method: 'post',
  headers: {
    'Accept': 'application/json'
  },
  contentType: 'application/json',
  // data: '{   }',
  data: JSON.stringify({})
}).done(function(response) {
  console.log(response);
});
