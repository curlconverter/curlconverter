wget --header="X-Requested-With: curl" \
  --header="Content-Type: text/xml" \
  --user=USER \
  --password=PASS \
  --auth-no-challenge \
  --post-file=add_params.xml \
  --output-document - \
  "http://localhost:28139/api/2.0/fo/auth/unix/?action=create&title=UnixRecord&username=root&password=abc123&ips=10.10.10.10"
