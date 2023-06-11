import Foundation

let url = URL(string: "http://localhost:28139/api/2.0/files/content")!

var request = URLRequest(url: url)
request.httpMethod = "POST"
request.setValue("Bearer ACCESS_TOKEN", forHTTPHeaderField: "Authorization")
let task = URLSession.shared.dataTask(with: request) { (data, response, error) in
    if let error = error {
        print("Error: \(error)")
    } else if let data = data {
        let str = String(data: data, encoding: .utf8)
        print("Received data:\n\(str ?? "")")
    }
}

task.resume()
