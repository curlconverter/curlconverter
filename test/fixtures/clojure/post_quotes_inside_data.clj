(require '[clj-http.client :as client])

(client/post "http://localhost:28139" {:form-params {:field "don't you like quotes"}})
