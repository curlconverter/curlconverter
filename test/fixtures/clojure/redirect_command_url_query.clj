(require '[clj-http.client :as client])
(use '[clojure.java.shell :only [sh]])

(client/get (str "http://localhost:28139?@" (sh "bash" "-c" "echo image.jpg")))
