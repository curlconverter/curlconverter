(require '[clj-http.client :as client])

(client/patch "http://localhost:28139/patch" {:multipart [{:name "file1" :content (clojure.java.io/file "./test/fixtures/curl_commands/delete.sh")}
                                                          {:name "form1" :content "form+data+1"}
                                                          {:name "form2" :content "form_data_2"}]})
