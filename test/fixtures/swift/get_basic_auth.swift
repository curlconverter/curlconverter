import Foundation

let url = URL(string: "http://localhost:28139/")!

let username = "some_username"
let password = "some_password"
let loginString = String(format: "\(username):\(password)", username, password)
let loginData = loginString.data(using: String.Encoding.utf8)!
let base64LoginString = loginData.base64EncodedString()

let headers = [
    "Authorization": "Basic \(base64LoginString)"
]

var request = URLRequest(url: url)

let task = URLSession.shared.dataTask(with: request) { (data, response, error) in
    if let error = error {
        print(error)
    } else if let data = data {
        let str = String(data: data, encoding: .utf8)
        print(str ?? "")
    }
}

task.resume()
