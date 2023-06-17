import Foundation

let data = NSMutableData(data: "CultureId=1".data(using: .utf8)!)
data.append("&ApplicationId=1".data(using: .utf8)!)
data.append("&RecordsPerPage=200".data(using: .utf8)!)
data.append("&MaximumResults=200".data(using: .utf8)!)
data.append("&PropertyTypeId=300".data(using: .utf8)!)
data.append("&TransactionTypeId=2".data(using: .utf8)!)
data.append("&StoreyRange=0-0".data(using: .utf8)!)
data.append("&BuildingTypeId=1".data(using: .utf8)!)
data.append("&BedRange=0-0".data(using: .utf8)!)
data.append("&BathRange=0-0".data(using: .utf8)!)
data.append("&LongitudeMin=-79.3676805496215".data(using: .utf8)!)
data.append("&LongitudeMax=-79.27300930023185".data(using: .utf8)!)
data.append("&LatitudeMin=43.660358732823845".data(using: .utf8)!)
data.append("&LatitudeMax=43.692390574029936".data(using: .utf8)!)
data.append("&SortOrder=A".data(using: .utf8)!)
data.append("&SortBy=1".data(using: .utf8)!)
data.append("&viewState=m".data(using: .utf8)!)
data.append("&Longitude=-79.4107246398925".data(using: .utf8)!)
data.append("&Latitude=43.6552047278685".data(using: .utf8)!)
data.append("&ZoomLevel=13".data(using: .utf8)!)
data.append("&CurrentPage=1".data(using: .utf8)!)

let url = URL(string: "http://localhost:28139/api/Listing.svc/PropertySearch_Post")!
let headers = [
    "Origin": "http://www.realtor.ca",
    "Accept-Encoding": "gzip, deflate",
    "Accept-Language": "en-US,en;q=0.8",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "Accept": "*/*",
    "Referer": "http://www.realtor.ca/Residential/Map.aspx",
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
