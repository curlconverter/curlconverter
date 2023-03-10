(require '[clj-http.client :as client])

(client/post "http://localhost:28139/targetservice" {:multipart [{:name "image" :content (clojure.java.io/file "image.jpg")}]})
