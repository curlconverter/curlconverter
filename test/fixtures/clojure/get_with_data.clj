(require '[clj-http.client :as client])

(client/get "http://localhost:28139/synthetics/api/v3/monitors" {:query-params {:test "2"
                                                                                :limit "100"
                                                                                :w "4"}
                                                                 :headers {"X-Api-Key" "123456789"}})
