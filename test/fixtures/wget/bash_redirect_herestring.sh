wget --header="'Accept': 'application/json'" \
  --header="Authorization: Bearer 000000000000000-0000" \
  --header="Content-Type: application/json" \
  --post-data='$MYVARIABLE' \
  --output-document - \
  http://localhost:28139/api/servers/00000000000/shared_servers/
