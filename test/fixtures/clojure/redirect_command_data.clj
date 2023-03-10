(require '[clj-http.client :as client])
(use '[clojure.java.shell :only [sh]])

(client/post "http://localhost:28139" {:headers {"Content-Type" "application/x-www-form-urlencoded"}
                                       :body (str "foo&" (clojure.java.io/file (sh "bash" "-c" "echo myfile.jg")))})
