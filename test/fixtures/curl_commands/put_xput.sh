curl -XPUT 'http://localhost:9200/twitter/_mapping/user?pretty' -H 'Content-Type: application/json' -d '\
{\
"properties": {\
"email": {\
"type": "keyword"\
}\
}\
}'
