curl https://upload.box.com/api/2.0/files/content -H "Authorization: Bearer ACCESS_TOKEN" -X POST -F attributes='{"name":"tigers.jpeg", "parent":{"id":"11446498"}}' -F file=@myfile.jpg
