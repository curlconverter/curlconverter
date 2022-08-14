curl http://localhost:28139/api/2.0/files/content \
    -H "Authorization: Bearer ACCESS_TOKEN" \
    -X POST \
    -H 'X-Nice: Header' \
    -F attributes='{"name":"tigers.jpeg", "parent":{"id":"11446498"}}' \
    -F file=@myfile.jpg
