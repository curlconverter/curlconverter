import Foundation

let url = URL(string: "http://localhost:28139/v2/alerts_policy_channels.json?policy_id=policy_id&channel_ids=channel_id")!

var request = URLRequest(url: url)
request.httpMethod = "PUT"
request.setValue("{admin_api_key}", forHTTPHeaderField: "X-Api-Key")
request.setValue("application/json", forHTTPHeaderField: "Content-Type")
let task = URLSession.shared.dataTask(with: request) { (data, response, error) in
    if let error = error {
        print("Error: \(error)")
    } else if let data = data {
        let str = String(data: data, encoding: .utf8)
        print("Received data:\n\(str ?? "")")
    }
}

task.resume()
