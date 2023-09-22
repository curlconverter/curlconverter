#import <Foundation/Foundation.h>

NSURL *url = [NSURL URLWithString:@"http://localhost:28139/v3"];
NSDictionary *headers = @{
    @"Authorization": @"Basic dGVzdDo="
};

NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:url];
[request setHTTPMethod:@"POST"];
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
