wget --header="A: ''a'" \
  --header='B: "' \
  --header="Cookie: x=1'; y=2\"" \
  --header="Content-Type: application/x-www-form-urlencoded" \
  --user="ol'" \
  --password='asd"' \
  --auth-no-challenge \
  --post-data="a=b&c=\"&d='" \
  --output-document - \
  http://localhost:28139
