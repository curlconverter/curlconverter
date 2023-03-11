(require '[clj-http.client :as client])

(client/get "http://localhost:28139" {:socket-timeout 6720
                                      :connection-timeout 13999.9})
