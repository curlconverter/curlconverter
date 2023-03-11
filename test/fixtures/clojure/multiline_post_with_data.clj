(require '[clj-http.client :as client])

(client/get "http://localhost:28139/echo/html/" {:headers {"Origin" "http://fiddle.jshell.net"}
                                                 :form-params {:msg1 "value1"
                                                               :msg2 "value2"}})
