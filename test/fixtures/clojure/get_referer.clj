(require '[clj-http.client :as client])

(client/get "http://localhost:28139" {:headers {"X-Requested-With" "XMLHttpRequest",
                                                "User-Agent" "SimCity",
                                                "Referer" "https://website.com"}})
