wget --header="Content-Type: application/json" \
  --header="Accept: application/json" \
  --post-data='{ "drink": "coffe" }' \
  --output-document - \
  http://localhost:28139
