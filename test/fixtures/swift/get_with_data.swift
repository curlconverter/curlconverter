import Foundation

let url = URL(string: "http://localhost:28139/synthetics/api/v3/monitors?test=2&limit=100&w=4")!
let headers = [
    "X-Api-Key": "123456789"
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
