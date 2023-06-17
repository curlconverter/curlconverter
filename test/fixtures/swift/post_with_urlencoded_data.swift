import Foundation

let data = NSMutableData(data: "msg1=wow".data(using: .utf8)!)
data.append("&msg2=such".data(using: .utf8)!)

let url = URL(string: "http://localhost:28139/echo/html/")!
let headers = [
    "Origin": "http://fiddle.jshell.net",
    "Accept-Encoding": "gzip, deflate",
    "Accept-Language": "en-US,en;q=0.8",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "Accept": "*/*",
    "Referer": "http://fiddle.jshell.net/_display/",
    "X-Requested-With": "XMLHttpRequest",
    "Connection": "keep-alive"
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
