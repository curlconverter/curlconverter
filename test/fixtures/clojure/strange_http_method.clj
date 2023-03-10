(require '[clj-http.client :as client])

(client/request {:url "http://localhost:28139"
                 :method "wHat"})
