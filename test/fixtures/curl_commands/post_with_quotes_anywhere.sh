curl 'http://localhost:28139' \
    -d "a=b&c=\"&d='" \
    -u "ol':asd\"" \
    -H "A: ''a'" \
    -H 'B: "' \
    -H "Cookie: x=1'; y=2\""
