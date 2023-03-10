(require '[clj-http.client :as client])

(client/post "http://localhost:28139/api/library" {:headers {"accept" "application/json",
                                                             "Content-Type" "multipart/form-data"}
                                                   :multipart [{:name "files" :content (clojure.java.io/file "47.htz")}
                                                               {:name "name" :content "47"}
                                                               {:name "oldMediaId" :content "47"}
                                                               {:name "updateInLayouts" :content "1"}
                                                               {:name "deleteOldRevisions" :content "1"}]})
