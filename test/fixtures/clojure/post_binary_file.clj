(require '[clj-http.client :as client])

(client/post "http://localhost:28139/american-art/query" {:headers {"Content-type" "application/sparql-query",
                                                                    "Accept" "application/sparql-results+json"}
                                                          :body (clojure.java.io/file "./sample.sparql")})
