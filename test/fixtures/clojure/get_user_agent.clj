(require '[clj-http.client :as client])

(client/get "http://localhost:28139/vc/moviesmagic" {:query-params {:p "5"
                                                                    :pub "testmovie"
                                                                    :tkn "817263812"}
                                                     :headers {"x-msisdn" "XXXXXXXXXXXXX",
                                                               "user-agent" "Mozilla Android6.1"}})
