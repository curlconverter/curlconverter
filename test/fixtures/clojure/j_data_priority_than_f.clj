(require '[clj-http.client :as client])

(client/post "http://localhost:28139/post" {:form-params {:data1 "data1"
                                                          :data2 "data2"
                                                          :data3 "data3"}})
