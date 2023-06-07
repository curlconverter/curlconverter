$.ajax({
  url: 'http://localhost:28139/',
  crossDomain: true,
  username: 'some_username',
  password: 'some_password'
}).done(function(response) {
  console.log(response);
});
