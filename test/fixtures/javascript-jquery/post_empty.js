$.ajax({
  url: 'http://localhost:28139',
  crossDomain: true,
  method: 'post',
  contentType: 'application/x-www-form-urlencoded',
  data: ''
}).done(function(response) {
  console.log(response);
});
