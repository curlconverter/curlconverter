import Foundation

let url = URL(string: "http://localhost:28139")!

var request = URLRequest(url: url)
let task = URLSession.shared.dataTask(with: request) { (data, response, error) in
    if let error = error {
        print("Error: \(error)")
    } else if let data = data {
        let str = String(data: data, encoding: .utf8)
        print("Received data:\n\(str ?? "")")
    }
}

task.resume()
