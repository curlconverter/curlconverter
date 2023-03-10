(require '[clj-http.client :as client])

(client/get "http://localhost:28139/get" {:headers {"Content-Type" "text/xml;charset=UTF-8",
                                                    "getWorkOrderCancel" ""}})
