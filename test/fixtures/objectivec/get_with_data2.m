#import <Foundation/Foundation.h>

NSURL *url = [NSURL URLWithString:@"http://localhost:28139/v2/alerts_policy_channels.json?policy_id=policy_id&channel_ids=channel_id"];
NSDictionary *headers = @{
    @"X-Api-Key": @"{admin_api_key}",
    @"Content-Type": @"application/json"
};

NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:url];
[request setHTTPMethod:@"PUT"];
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
