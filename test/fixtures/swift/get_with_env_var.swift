import Foundation

let url = URL(string: "http://localhost:28139/v2/images?type=distribution")!

var request = URLRequest(url: url)
request.setValue("application/json", forHTTPHeaderField: "Content-Type")
request.setValue("Bearer " + ProcessInfo.processInfo.environment["DO_API_TOKEN"], forHTTPHeaderField: "Authorization")
let task = URLSession.shared.dataTask(with: request) { (data, response, error) in
    if let error = error {
        print("Error: \(error)")
    } else if let data = data {
        let str = String(data: data, encoding: .utf8)
        print("Received data:\n\(str ?? "")")
    }
}

task.resume()
