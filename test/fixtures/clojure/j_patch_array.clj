(require '[clj-http.client :as client])

(client/patch "http://localhost:28139/patch" {:headers {"Content-Type" "application/x-www-form-urlencoded"}
                                              :body "item[]=1&item[]=2&item[]=3"})
