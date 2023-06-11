import Foundation

let url = URL(string: "http://localhost:28139/echo/html/")!

var request = URLRequest(url: url)
request.httpMethod = "POST"
request.setValue("http://fiddle.jshell.net", forHTTPHeaderField: "Origin")
request.setValue("gzip, deflate", forHTTPHeaderField: "Accept-Encoding")
request.setValue("en-US,en;q=0.8", forHTTPHeaderField: "Accept-Language")
request.setValue("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36", forHTTPHeaderField: "User-Agent")
request.setValue("application/x-www-form-urlencoded; charset=UTF-8", forHTTPHeaderField: "Content-Type")
request.setValue("*/*", forHTTPHeaderField: "Accept")
request.setValue("http://fiddle.jshell.net/_display/", forHTTPHeaderField: "Referer")
request.setValue("XMLHttpRequest", forHTTPHeaderField: "X-Requested-With")
request.setValue("keep-alive", forHTTPHeaderField: "Connection")
request.httpBody = "msg1=wow&msg2=such".data(using: .utf8)

let task = URLSession.shared.dataTask(with: request) { (data, response, error) in
    if let error = error {
        print("Error: \(error)")
    } else if let data = data {
        let str = String(data: data, encoding: .utf8)
        print("Received data:\n\(str ?? "")")
    }
}

task.resume()
