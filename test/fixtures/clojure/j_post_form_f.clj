(require '[clj-http.client :as client])

(client/post "http://localhost:28139/post" {:multipart [{:name "d1" :content "data1"}
                                                        {:name "d2" :content "data"}]})
