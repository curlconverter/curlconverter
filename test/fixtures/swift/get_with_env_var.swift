import Foundation

let url = URL(string: "http://localhost:28139/v2/images?type=distribution")!
let headers = [
    "Content-Type": "application/json",
    "Authorization": "Bearer " + (ProcessInfo.processInfo.environment["DO_API_TOKEN"] ?? "")
]

var request = URLRequest(url: url)
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
