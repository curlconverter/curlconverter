(require '[cheshire.core :as json])
(require '[clj-http.client :as client])

(client/post "http://localhost:28139/rest/login-sessions" {:headers {"X-API-Version" "200"}
                                                           :form-params {:userName "username123" :password "password123" :authLoginDomain "local"}
                                                           ;; :body "{\"userName\":\"username123\",\"password\":\"password123\", \"authLoginDomain\":\"local\"}"
                                                           :content-type :json
                                                           :insecure? true})
