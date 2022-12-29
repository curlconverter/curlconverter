curl -XPUT 'http://localhost:28139/twitter/_mapping/user?pretty' -H 'Content-Type: application/json' -d "\
{\
\"properties\": {\
\"email\": {\
\"type\": \"keyword\"\
}\
}\
}"
