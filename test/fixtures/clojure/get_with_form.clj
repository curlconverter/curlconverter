(require '[clj-http.client :as client])

(client/post "http://localhost:28139/v3" {:basic-auth ["test" ""]
                                          :multipart [{:name "from" :content "test@tester.com"}
                                                      {:name "to" :content "devs@tester.net"}
                                                      {:name "subject" :content "Hello"}
                                                      {:name "text" :content "Testing the converter!"}]})
