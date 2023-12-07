using HTTP

body = open(read, "file.txt", "b")

resp = HTTP.put(
    "http://localhost:28139/file.txt",
    [],
    body
)
