$.ajax({
  url: 'http://localhost:28139/post',
  crossDomain: true,
  method: 'post',
  contentType: 'application/x-www-form-urlencoded',
  data: 'secret=*%5*!'
}).done(function(response) {
  console.log(response);
});
