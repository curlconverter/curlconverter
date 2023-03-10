(require '[clj-http.client :as client])

(client/get "http://localhost:28139" {:headers {"sec-ch-ua" "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"92\""}})
