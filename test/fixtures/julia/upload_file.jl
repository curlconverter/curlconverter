using HTTP

body = open("file.txt", "r")

resp = HTTP.put("http://localhost:28139/file.txt", [], body)
