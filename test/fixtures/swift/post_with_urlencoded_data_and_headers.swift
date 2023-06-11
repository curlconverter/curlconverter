import Foundation

let url = URL(string: "http://localhost:28139/api/Listing.svc/PropertySearch_Post")!

var request = URLRequest(url: url)
request.httpMethod = "POST"
request.setValue("http://www.realtor.ca", forHTTPHeaderField: "Origin")
request.setValue("gzip, deflate", forHTTPHeaderField: "Accept-Encoding")
request.setValue("en-US,en;q=0.8", forHTTPHeaderField: "Accept-Language")
request.setValue("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36", forHTTPHeaderField: "User-Agent")
request.setValue("application/x-www-form-urlencoded; charset=UTF-8", forHTTPHeaderField: "Content-Type")
request.setValue("*/*", forHTTPHeaderField: "Accept")
request.setValue("http://www.realtor.ca/Residential/Map.aspx", forHTTPHeaderField: "Referer")
request.setValue("keep-alive", forHTTPHeaderField: "Connection")
request.httpBody = "CultureId=1&ApplicationId=1&RecordsPerPage=200&MaximumResults=200&PropertyTypeId=300&TransactionTypeId=2&StoreyRange=0-0&BuildingTypeId=1&BedRange=0-0&BathRange=0-0&LongitudeMin=-79.3676805496215&LongitudeMax=-79.27300930023185&LatitudeMin=43.660358732823845&LatitudeMax=43.692390574029936&SortOrder=A&SortBy=1&viewState=m&Longitude=-79.4107246398925&Latitude=43.6552047278685&ZoomLevel=13&CurrentPage=1".data(using: .utf8)

let task = URLSession.shared.dataTask(with: request) { (data, response, error) in
    if let error = error {
        print("Error: \(error)")
    } else if let data = data {
        let str = String(data: data, encoding: .utf8)
        print("Received data:\n\(str ?? "")")
    }
}

task.resume()
