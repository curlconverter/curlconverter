http --multipart \
  :28139/api/2.0/files/content \
  "Authorization:Bearer ACCESS_TOKEN" \
  attributes='{"name":"tigers.jpeg", "parent":{"id":"11446498"}}' \
  file@myfile.jpg
