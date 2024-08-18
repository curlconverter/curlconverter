require 'httparty'

url = 'http://localhost:28139/api/library'
headers = {
  'accept': 'application/json',
  'Content-Type': 'multipart/form-data',
}
body = {
  files: File.open('47.htz')
  name: '47'
  oldMediaId: '47'
  updateInLayouts: '1'
  deleteOldRevisions: '1'
}
res = HTTParty.post(url, headers: headers, body: body)
