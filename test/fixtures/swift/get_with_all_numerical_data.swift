import Foundation

let url = URL(string: "http://localhost:28139/CurlToNode")!
let headers = [
    "Content-Type": "application/json",
    "Accept": "application/json"
]

var request = URLRequest(url: url)
request.httpMethod = "POST"
request.allHTTPHeaderFields = headers
request.httpBody = "18233982904".data(using: .utf8)

let task = URLSession.shared.dataTask(with: request) { (data, response, error) in
    if let error = error {
        print(error)
    } else if let data = data {
        let str = String(data: data, encoding: .utf8)
        print(str ?? "")
    }
}

task.resume()
