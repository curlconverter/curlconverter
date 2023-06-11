import Foundation

let url = URL(string: "http://localhost:28139/synthetics/api/v3/monitors?test=2&limit=100&w=4")!

var request = URLRequest(url: url)
request.setValue("123456789", forHTTPHeaderField: "X-Api-Key")
let task = URLSession.shared.dataTask(with: request) { (data, response, error) in
    if let error = error {
        print("Error: \(error)")
    } else if let data = data {
        let str = String(data: data, encoding: .utf8)
        print("Received data:\n\(str ?? "")")
    }
}

task.resume()
