(require '[cheshire.core :as json])
(require '[clj-http.client :as client])

(client/put "http://localhost:28139/twitter/_mapping/user?pretty" {:form-params {:properties {:email {:type "keyword"}}}
                                                                   ;; :body "{\"properties\": {\"email\": {\"type\": \"keyword\"}}}"
                                                                   :content-type :json})
