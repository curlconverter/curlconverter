curl 'http://localhost:9200/twitter/_mapping/user?pretty' -H 'Content-Type: application/json' -T my_file.txt -d '\
{\
"properties": {\
"email": {\
"type": "keyword"\
}\
}\
}'
