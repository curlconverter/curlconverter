wget --method=PATCH \
  --header="Content-Type: application/x-www-form-urlencoded" \
  --body-data="item[]=1&item[]=2&item[]=3" \
  --output-document - \
  http://localhost:28139/patch
