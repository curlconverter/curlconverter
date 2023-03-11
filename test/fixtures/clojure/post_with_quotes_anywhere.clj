(require '[clj-http.client :as client])

(client/post "http://localhost:28139" {:headers {"A" "''a'",
                                                 "B" "\"",
                                                 "Cookie" "x=1'; y=2\"",
                                                 "Content-Type" "application/x-www-form-urlencoded"}
                                       :basic-auth ["ol'" "asd\""]
                                       :body "a=b&c=\"&d='"})
