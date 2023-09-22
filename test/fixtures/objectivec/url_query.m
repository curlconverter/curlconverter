#import <Foundation/Foundation.h>

NSURL *url = [NSURL URLWithString:@"http://localhost:28139?foo=bar&baz=qux"];
NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:url];

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
