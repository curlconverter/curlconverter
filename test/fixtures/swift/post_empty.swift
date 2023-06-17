import Foundation

let data = NSMutableData(data: "".data(using: .utf8)!)

let url = URL(string: "http://localhost:28139")!
let headers = [
    "Content-Type": "application/x-www-form-urlencoded"
]

var request = URLRequest(url: url)
request.httpMethod = "POST"
request.allHTTPHeaderFields = headers
request.httpBody = data as Data

let task = URLSession.shared.dataTask(with: request) { (data, response, error) in
    if let error = error {
        print(error)
    } else if let data = data {
        let str = String(data: data, encoding: .utf8)
        print(str ?? "")
    }
}

task.resume()
