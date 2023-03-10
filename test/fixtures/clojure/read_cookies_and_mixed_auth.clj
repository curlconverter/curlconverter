(require '[clj-http.client :as client])

(client/get "http://localhost:28139" {:headers {"Authorization" "Bearer AAAAAAAAAAAA"}
                                      :basic-auth ["user" "pass"]})
