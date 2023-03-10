(require '[clj-http.client :as client])

(client/get "http://localhost:28139" {:socket-timeout 20000
                                      :connection-timeout 20000})
