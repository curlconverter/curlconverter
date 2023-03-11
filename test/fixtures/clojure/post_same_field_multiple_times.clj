(require '[clj-http.client :as client])

(client/post "http://localhost:28139/" {:form-params {:foo ["bar" "" "barbar"]}})
