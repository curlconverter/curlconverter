let xhr = new XMLHttpRequest();
xhr.withCredentials = true;
xhr.open('GET', 'http://localhost:28139?foo=bar&baz=qux');

xhr.onload = function() {
  console.log(xhr.response);
};

xhr.send();
