(require '[clj-http.client :as client])

(client/post "http://localhost:28139/api/oauth/token/" {:basic-auth ["foo" "bar"]
                                                        :form-params {:grant_type "client_credentials"}})
