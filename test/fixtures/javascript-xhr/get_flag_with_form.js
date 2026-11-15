const form = new FormData();
form.append('name', 'value');

let xhr = new XMLHttpRequest();
xhr.withCredentials = true;
xhr.open('POST', 'http://localhost:28139/upload');

xhr.onload = function() {
  console.log(xhr.response);
};

xhr.send(form);
