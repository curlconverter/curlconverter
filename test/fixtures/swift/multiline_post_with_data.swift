import Foundation

let data = NSMutableData(data: "msg1=value1".data(using: .utf8)!)
data.append("&msg2=value2".data(using: .utf8)!)

let url = URL(string: "http://localhost:28139/echo/html/")!
let headers = [
    "Origin": "http://fiddle.jshell.net",
    "Content-Type": "application/x-www-form-urlencoded"
]

var request = URLRequest(url: url)
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
