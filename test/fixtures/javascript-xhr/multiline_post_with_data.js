const data = new URLSearchParams({
  'msg1': 'value1',
  'msg2': 'value2'
});

let xhr = new XMLHttpRequest();
xhr.withCredentials = true;
xhr.open('GET', 'http://localhost:28139/echo/html/');
xhr.setRequestHeader('Origin', 'http://fiddle.jshell.net');
xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

xhr.onload = function() {
  console.log(xhr.response);
};

xhr.send(data);
