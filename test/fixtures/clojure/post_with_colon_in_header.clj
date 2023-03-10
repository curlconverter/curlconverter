(require '[clj-http.client :as client])

(client/post "http://localhost:28139/endpoint" {:headers {"Content-Type" "application/json",
                                                          "key" "abcdefg"}})
