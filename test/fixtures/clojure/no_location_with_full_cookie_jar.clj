(require '[clj-http.client :as client])

(client/get "http://localhost:28139" {:redirect-strategy :none})
