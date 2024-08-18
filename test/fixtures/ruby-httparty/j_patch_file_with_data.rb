require 'httparty'

url = 'http://localhost:28139/patch'
body = {
  file1: File.open('./test/fixtures/curl_commands/delete.sh')
  form1: 'form+data+1'
  form2: 'form_data_2'
}
res = HTTParty.patch(url, body: body)
