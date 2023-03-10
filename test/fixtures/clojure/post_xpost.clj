(require '[clj-http.client :as client])

(client/post "http://localhost:28139/api/xxxxxxxxxxxxxxxx" {:headers {"Content-Type" "application/x-www-form-urlencoded"}
                                                            :body "{\"keywords\":\"php\",\"page\":1,\"searchMode\":1}"})
