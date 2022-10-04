response = HTTPoison.post!(
  "http://localhost:28139/api/2.0/files/content",
  {:multipart, [
    {"attributes", "{\"name\":\"tigers.jpeg\", \"parent\":{\"id\":\"11446498\"}}"},
    {:file, "myfile.jpg", {"form-data", [{:name, "file"}, {:filename, Path.basename("myfile.jpg")}]}, []}
  ]},
  [
    {"Authorization", "Bearer ACCESS_TOKEN"}
  ]
)
