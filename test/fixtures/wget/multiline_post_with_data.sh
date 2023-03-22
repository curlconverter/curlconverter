wget --method=GET \
  --header="Origin: http://fiddle.jshell.net" \
  --header="Content-Type: application/x-www-form-urlencoded" \
  --body-data="msg1=value1&msg2=value2" \
  --output-document - \
  http://localhost:28139/echo/html/
