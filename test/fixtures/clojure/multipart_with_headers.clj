(require '[clj-http.client :as client])

(client/post "http://localhost:28139/api/2.0/files/content" {:headers {"Authorization" "Bearer ACCESS_TOKEN",
                                                                       "X-Nice" "Header"}
                                                             :multipart [{:name "attributes" :content "{\"name\":\"tigers.jpeg\", \"parent\":{\"id\":\"11446498\"}}"}
                                                                         {:name "file" :content (clojure.java.io/file "myfile.jpg")}]})
