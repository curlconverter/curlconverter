import Foundation

let url = URL(string: "http://localhost:28139/echo/html/")!

var request = URLRequest(url: url)
request.setValue("http://fiddle.jshell.net", forHTTPHeaderField: "Origin")
request.setValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")
request.httpBody = "msg1=value1&msg2=value2".data(using: .utf8)

let task = URLSession.shared.dataTask(with: request) { (data, response, error) in
    if let error = error {
        print("Error: \(error)")
    } else if let data = data {
        let str = String(data: data, encoding: .utf8)
        print("Received data:\n\(str ?? "")")
    }
}

task.resume()
