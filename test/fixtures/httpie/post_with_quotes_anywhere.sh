http -a "ol':asd\"" \
  --raw "a=b&c=\"&d='" \
  http://localhost:28139 \
  "A:''a'" \
  'B:"' \
  "Cookie:x=1'; y=2\"" \
  Content-Type:application/x-www-form-urlencoded
