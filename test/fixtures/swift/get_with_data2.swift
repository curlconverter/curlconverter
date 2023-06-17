import Foundation

let url = URL(string: "http://localhost:28139/v2/alerts_policy_channels.json?policy_id=policy_id&channel_ids=channel_id")!
let headers = [
    "X-Api-Key": "{admin_api_key}",
    "Content-Type": "application/json"
]

var request = URLRequest(url: url)
request.httpMethod = "PUT"
request.allHTTPHeaderFields = headers

let task = URLSession.shared.dataTask(with: request) { (data, response, error) in
    if let error = error {
        print(error)
    } else if let data = data {
        let str = String(data: data, encoding: .utf8)
        print(str ?? "")
    }
}

task.resume()
