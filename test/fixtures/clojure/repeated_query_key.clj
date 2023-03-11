(require '[clj-http.client :as client])

(client/get "http://localhost:28139" {:query-params {:key ["one" "two"]}})
