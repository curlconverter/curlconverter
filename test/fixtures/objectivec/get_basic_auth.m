#import <Foundation/Foundation.h>

NSURL *url = [NSURL URLWithString:@"http://localhost:28139/"];

NSString *credentials = [NSString stringWithFormat:@"%@:%@", @"some_username", @"some_password"];
NSData *credentialsData = [credentials dataUsingEncoding:NSUTF8StringEncoding];
NSString *base64Credentials = [credentialsData base64EncodedStringWithOptions:0];
NSDictionary *headers = @{
    @"Authorization": [NSString stringWithFormat:@"Basic %@", base64Credentials]
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
