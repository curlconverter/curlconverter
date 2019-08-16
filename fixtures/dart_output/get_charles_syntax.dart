import 'package:http/http.dart' as http;

void main() async {
  var headers = {
    'Host': 'api.ipify.org',
    'Accept': '*/*',
    'User-Agent': 'GiftTalk/2.7.2 (iPhone; iOS 9.0.2; Scale/3.00)',
    'Accept-Language': 'en-CN;q=1, zh-Hans-CN;q=0.9',
    'Accept-Encoding': 'gzip',
  };

  var res = await http.get('http://api.ipify.org/?format=json&', headers: headers);
  if (res.statusCode != 200) throw Exception('get error: statusCode= ${res.statusCode}');
  print(res.body);
}
