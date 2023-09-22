#import <Foundation/Foundation.h>

NSURL *url = [NSURL URLWithString:@"http://localhost:28139/api/Listing.svc/PropertySearch_Post"];
NSDictionary *headers = @{
    @"Origin": @"http://www.realtor.ca",
    @"Accept-Encoding": @"gzip, deflate",
    @"Accept-Language": @"en-US,en;q=0.8",
    @"User-Agent": @"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36",
    @"Content-Type": @"application/x-www-form-urlencoded; charset=UTF-8",
    @"Accept": @"*/*",
    @"Referer": @"http://www.realtor.ca/Residential/Map.aspx",
    @"Connection": @"keep-alive"
};

NSMutableData *data = [[NSMutableData alloc] initWithData:[@"CultureId=1" dataUsingEncoding:NSUTF8StringEncoding]];
[data appendData:[@"&ApplicationId=1" dataUsingEncoding:NSUTF8StringEncoding]];
[data appendData:[@"&RecordsPerPage=200" dataUsingEncoding:NSUTF8StringEncoding]];
[data appendData:[@"&MaximumResults=200" dataUsingEncoding:NSUTF8StringEncoding]];
[data appendData:[@"&PropertyTypeId=300" dataUsingEncoding:NSUTF8StringEncoding]];
[data appendData:[@"&TransactionTypeId=2" dataUsingEncoding:NSUTF8StringEncoding]];
[data appendData:[@"&StoreyRange=0-0" dataUsingEncoding:NSUTF8StringEncoding]];
[data appendData:[@"&BuildingTypeId=1" dataUsingEncoding:NSUTF8StringEncoding]];
[data appendData:[@"&BedRange=0-0" dataUsingEncoding:NSUTF8StringEncoding]];
[data appendData:[@"&BathRange=0-0" dataUsingEncoding:NSUTF8StringEncoding]];
[data appendData:[@"&LongitudeMin=-79.3676805496215" dataUsingEncoding:NSUTF8StringEncoding]];
[data appendData:[@"&LongitudeMax=-79.27300930023185" dataUsingEncoding:NSUTF8StringEncoding]];
[data appendData:[@"&LatitudeMin=43.660358732823845" dataUsingEncoding:NSUTF8StringEncoding]];
[data appendData:[@"&LatitudeMax=43.692390574029936" dataUsingEncoding:NSUTF8StringEncoding]];
[data appendData:[@"&SortOrder=A" dataUsingEncoding:NSUTF8StringEncoding]];
[data appendData:[@"&SortBy=1" dataUsingEncoding:NSUTF8StringEncoding]];
[data appendData:[@"&viewState=m" dataUsingEncoding:NSUTF8StringEncoding]];
[data appendData:[@"&Longitude=-79.4107246398925" dataUsingEncoding:NSUTF8StringEncoding]];
[data appendData:[@"&Latitude=43.6552047278685" dataUsingEncoding:NSUTF8StringEncoding]];
[data appendData:[@"&ZoomLevel=13" dataUsingEncoding:NSUTF8StringEncoding]];
[data appendData:[@"&CurrentPage=1" dataUsingEncoding:NSUTF8StringEncoding]];

NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:url];
[request setHTTPMethod:@"POST"];
[request setAllHTTPHeaderFields:headers];
[request setHTTPBody:data];

NSURLSessionConfiguration *defaultSessionConfiguration = [NSURLSessionConfiguration defaultSessionConfiguration];
NSURLSession *session = [NSURLSession sessionWithConfiguration:defaultSessionConfiguration];
NSURLSessionDataTask *dataTask = [session dataTaskWithRequest:request completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
    if (error) {
        NSLog(@"%@", error);
    } else {
        NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse *) response;
        NSLog(@"%@", httpResponse);
    }
}];
[dataTask resume];
