const form = new FormData();
form.append('name', 'value');

$.post('http://localhost:28139/upload', form)
  .done(function(response) {
    console.log(response);
  });
