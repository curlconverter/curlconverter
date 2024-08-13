require 'httparty'

url = 'http://localhost:28139/v1/customer/disputes/PP-D-21692/provide-evidence'
headers = {
  'Content-Type': 'multipart/related; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW',
  'Authorization': 'Bearer A21AAGOs8Yauykf6g-avc0v7kdQVJipuyE2NuRdbA7VbOxRDSQLMBUs3HTYbe3mxkZng5VhLuQUhDplE6ZSxjWSSRhAwgDwzg',
}
res = HTTParty.post(url, headers: headers)



url = 'http://localhost:28139/cgi-bin/luci/admin/network/network/wan'
res = HTTParty.post(url)



url = 'http://localhost:28139/files/upload/ztaaInstaller/0.4.0+0.5.0+ssdf/darwin/arm64/FILE.txt'
headers = {
  'xtoken': 'TOKEN',
}
res = HTTParty.post(url, headers: headers)



url = 'http://localhost:28139/api/v1/files/upload'
res = HTTParty.post(url)



url = 'http://localhost:28139'
res = HTTParty.post(url)

