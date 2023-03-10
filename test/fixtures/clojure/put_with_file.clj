(require '[clj-http.client :as client])

(client/put "http://localhost:28139/upload" {:headers {"Content-Type" "application/x-www-form-urlencoded"}
                                             :body (clojure.java.io/file "new_file")})
