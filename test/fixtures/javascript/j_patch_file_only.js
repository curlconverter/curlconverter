const form = new FormData();
form.append('file1', File(['<data goes here>'], './test/fixtures/curl_commands/delete.sh'));

fetch('http://localhost:28139/patch', {
  method: 'PATCH',
  body: form
});
