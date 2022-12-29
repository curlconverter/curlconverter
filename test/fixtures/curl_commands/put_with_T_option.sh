curl 'http://localhost:28139/twitter/_mapping/user?pretty' -H 'Content-Type: application/json' -T my_file.txt -d "\
{\
\"properties\": {\
\"email\": {\
\"type\": \"keyword\"\
}\
}\
}"
