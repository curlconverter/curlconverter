import Foundation

let url = URL(string: "http://localhost:28139/api/2.0/files/content")!
let headers = [
    "Authorization": "Bearer ACCESS_TOKEN"
]

var request = URLRequest(url: url)
request.httpMethod = "POST"
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
