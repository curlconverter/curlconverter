(require '[clj-http.client :as client])

(client/post "http://localhost:28139/upload" {:multipart [{:name "name" :content "value"}]})
