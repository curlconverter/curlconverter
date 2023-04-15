echo foo | curl localhost:28139
echo foo | curl localhost:28139 | echo foo | curl localhost:28139
curl localhost:28139 | echo foo | echo bar | curl localhost:28139
