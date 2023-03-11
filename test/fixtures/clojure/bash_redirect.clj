(require '[clj-http.client :as client])

(client/post "http://localhost:28139/api/2.0/fo/auth/unix/" {:query-params {:action "create"
                                                                            :title "UnixRecord"
                                                                            :username "root"
                                                                            :password "abc123"
                                                                            :ips "10.10.10.10"}
                                                             :headers {"X-Requested-With" "curl",
                                                                       "Content-Type" "text/xml"}
                                                             :basic-auth ["USER" "PASS"]
                                                             :body (clojure.java.io/file "add_params.xml")})
