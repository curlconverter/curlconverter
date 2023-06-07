let xhr = new XMLHttpRequest();
xhr.withCredentials = true;
xhr.open(
  'GET',
  'http://localhost:28139/',
  true,
  'some_username',
  'some_password'
);

xhr.onload = function() {
  console.log(xhr.response);
};

xhr.send();
