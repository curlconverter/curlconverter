#import <Foundation/Foundation.h>

NSURL *url = [NSURL URLWithString:@"http://localhost:28139/v2/images?type=distribution"];
NSDictionary *headers = @{
    @"Content-Type": @"application/json",
    @"Authorization": [NSString stringWithFormat:@"%@%@", @"Bearer ", [[[NSProcessInfo processInfo] environment] objectForKey:@"DO_API_TOKEN"]]
};

NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:url];
[request setAllHTTPHeaderFields:headers];

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
