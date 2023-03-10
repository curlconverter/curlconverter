(require '[clj-http.client :as client])

(client/put "http://localhost:28139/file.txt")
