wget --header="Content-Type: application/x-www-form-urlencoded" \
  --post-data="msg1=wow&msg2=such&msg3=@rawmsg" \
  --output-document - \
  http://localhost:28139/post
