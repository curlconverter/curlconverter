$.ajax({
  url: 'http://localhost:28139/echo/html/',
  crossDomain: true,
  headers: {
    'Origin': 'http://fiddle.jshell.net'
  },
  contentType: 'application/x-www-form-urlencoded',
  data: {
    'msg1': 'value1',
    'msg2': 'value2'
  }
}).done(function(response) {
  console.log(response);
});
