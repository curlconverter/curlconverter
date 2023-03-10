(require '[cheshire.core :as json])
(require '[clj-http.client :as client])

(client/patch "http://localhost:28139/go/api/agents/adb9540a-b954-4571-9d9b-2f330739d4da"
              {:headers {"Accept" "application/vnd.go.cd.v4+json"}
               :basic-auth ["username" "password"]
               :form-params {:hostname "agent02.example.com"
                             :agent_config_state "Enabled"
                             :resources ["Java" "Linux"]
                             :environments ["Dev"]}
               ;; :body "{\n        \"hostname\": \"agent02.example.com\",\n        \"agent_config_state\": \"Enabled\",\n        \"resources\": [\"Java\",\"Linux\"],\n        \"environments\": [\"Dev\"]\n        }"
               :content-type :json})
