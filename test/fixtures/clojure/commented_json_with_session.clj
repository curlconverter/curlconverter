(require '[cheshire.core :as json])
(require '[clj-http.client :as client])

(client/post "http://localhost:28139" {:form-params {}
                                       ;; :body "{   }"
                                       :content-type :json
                                       :accept :json})
