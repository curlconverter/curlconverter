(require '[clj-http.client :as client])

(client/post "http://localhost:28139/CurlToNode" {:headers {"Content-Type" "application/json",
                                                            "Accept" "application/json"}
                                                  :body "18233982904"})
