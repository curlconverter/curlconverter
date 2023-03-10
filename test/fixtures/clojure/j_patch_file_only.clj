(require '[clj-http.client :as client])

(client/patch "http://localhost:28139/patch" {:multipart [{:name "file1" :content (clojure.java.io/file "./test/fixtures/curl_commands/delete.sh")}]})
