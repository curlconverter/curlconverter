wget --method=PUT \
  --header="Content-Type: application/x-www-form-urlencoded" \
  --body-file=file.txt \
  --output-document - \
  http://localhost:28139/file.txt \
  "http://localhost:28139/myfile.jpg?params=perurltoo" \
  http://localhost:28139


wget --header="Content-Type: application/x-www-form-urlencoded" \
  --post-data="different=data&time=now" \
  --output-document - \
  http://localhost:28139
