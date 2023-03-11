(require '[clj-http.client :as client])

(client/put "http://localhost:28139/test/_security" {:headers {"Content-Type" "application/x-www-form-urlencoded"}
                                                     :basic-auth ["admin" "123"]
                                                     :body "{\"admins\":{\"names\":[], \"roles\":[]}, \"readers\":{\"names\":[\"joe\"],\"roles\":[]}}"})
