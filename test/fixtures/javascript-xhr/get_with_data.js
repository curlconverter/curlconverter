let xhr = new XMLHttpRequest();
xhr.withCredentials = true;
xhr.open('GET', 'http://localhost:28139/synthetics/api/v3/monitors?test=2&limit=100&w=4');
xhr.setRequestHeader('X-Api-Key', '123456789');

xhr.onload = function() {
  console.log(xhr.response);
};

xhr.send();
