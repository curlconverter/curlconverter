(require '[clj-http.client :as client])

(client/get "http://localhost:28139/" {:basic-auth ["some_username" "some_password"]
                                       :insecure? true})
