(require '[clj-http.client :as client])

(client/get "http://localhost:28139" {:query-params {:foo "bar"
                                                     :baz "qux"}})
