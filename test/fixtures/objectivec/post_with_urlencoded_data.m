#import <Foundation/Foundation.h>

NSURL *url = [NSURL URLWithString:@"http://localhost:28139/echo/html/"];
NSDictionary *headers = @{
    @"Origin": @"http://fiddle.jshell.net",
    @"Accept-Encoding": @"gzip, deflate",
    @"Accept-Language": @"en-US,en;q=0.8",
    @"User-Agent": @"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36",
    @"Content-Type": @"application/x-www-form-urlencoded; charset=UTF-8",
    @"Accept": @"*/*",
    @"Referer": @"http://fiddle.jshell.net/_display/",
    @"X-Requested-With": @"XMLHttpRequest",
    @"Connection": @"keep-alive"
};

NSMutableData *data = [[NSMutableData alloc] initWithData:[@"msg1=wow" dataUsingEncoding:NSUTF8StringEncoding]];
[data appendData:[@"&msg2=such" dataUsingEncoding:NSUTF8StringEncoding]];

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
