(require '[cheshire.core :as json])
(require '[clj-http.client :as client])

(client/post "http://localhost:28139" {:form-params {:drink "coffe"}
                                       ;; :body "{ \"drink\": \"coffe\" }"
                                       :content-type :json
                                       :accept :json})
