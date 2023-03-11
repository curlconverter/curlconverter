(require '[clj-http.client :as client])

(client/post "http://localhost:28139/post-to-me.php" {:multipart [{:name "username" :content "davidwalsh"}
                                                                  {:name "password" :content "something"}]})
