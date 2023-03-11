(require '[clj-http.client :as client])

(client/get "http://localhost:28139/v2/images" {:query-params {:type "distribution"}
                                                :headers {"Content-Type" "application/json",
                                                          "Authorization" (str "Bearer " (str (System/getenv "DO_API_TOKEN")))}})
