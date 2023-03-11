const form = new FormData();
form.append('file1', File(['<data goes here>'], './test/fixtures/curl_commands/delete.sh'));
form.append('form1', 'form+data+1');
form.append('form2', 'form_data_2');

fetch('http://localhost:28139/patch', {
  method: 'PATCH',
  body: form
});
