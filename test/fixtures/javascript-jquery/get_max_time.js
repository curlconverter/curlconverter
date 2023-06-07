$.ajax({
  url: 'http://localhost:28139',
  crossDomain: true,
  timeout: 20000
}).done(function(response) {
  console.log(response);
});
