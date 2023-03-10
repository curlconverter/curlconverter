(require '[clj-http.client :as client])

(client/post "http://localhost:28139" {:headers {"Content-Type" "application/x-www-form-urlencoded"}
                                       :body (str "foo&" (clojure.java.io/file (str (System/getenv "FILENAME"))))})
