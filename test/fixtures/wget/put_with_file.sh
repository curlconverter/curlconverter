wget --method=PUT \
  --header="Content-Type: application/x-www-form-urlencoded" \
  --body-file=new_file \
  --output-document - \
  http://localhost:28139/upload
