$.ajax({
  url: 'http://localhost:28139',
  crossDomain: true,
  method: 'wHat'
}).done(function(response) {
  console.log(response);
});
