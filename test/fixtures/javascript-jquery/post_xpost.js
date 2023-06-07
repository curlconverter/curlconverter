$.ajax({
  url: 'http://localhost:28139/api/xxxxxxxxxxxxxxxx',
  crossDomain: true,
  method: 'post',
  contentType: 'application/x-www-form-urlencoded',
  data: '{"keywords":"php","page":1,"searchMode":1}'
}).done(function(response) {
  console.log(response);
});
