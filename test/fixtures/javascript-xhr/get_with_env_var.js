let xhr = new XMLHttpRequest();
xhr.withCredentials = true;
xhr.open('GET', 'http://localhost:28139/v2/images?type=distribution');
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.setRequestHeader('Authorization', 'Bearer ' + process.env['DO_API_TOKEN']);

xhr.onload = function() {
  console.log(xhr.response);
};

xhr.send();
