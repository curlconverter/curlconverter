require 'httparty'

url = 'http://localhost:28139/patch'
body = {
  file1: File.open('./test/fixtures/curl_commands/delete.sh')
}
res = HTTParty.patch(url, body: body)
