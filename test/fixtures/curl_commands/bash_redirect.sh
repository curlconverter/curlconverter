# https://github.com/curlconverter/curlconverter/issues/316
curl -H "X-Requested-With: curl" -H "Content-Type: text/xml" -u "USER:PASS" -X "POST" --data-binary @- "http://localhost:28139/api/2.0/fo/auth/unix/?action=create&title=UnixRecord&username=root&password=abc123&ips=10.10.10.10" < add_params.xml
