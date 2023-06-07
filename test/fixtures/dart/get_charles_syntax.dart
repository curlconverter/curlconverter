import 'package:http/http.dart' as http;

void main() async {
  final headers = {
    'Host': 'api.ipify.org',
    'Accept': '*/*',
    'User-Agent': 'GiftTalk/2.7.2 (iPhone; iOS 9.0.2; Scale/3.00)',
    'Accept-Language': 'en-CN;q=1, zh-Hans-CN;q=0.9',
    'Accept-Encoding': 'gzip',
  };

  final url = Uri.parse('http://localhost:28139/?format=json&');

  final res = await http.get(url, headers: headers);
  final status = res.statusCode;
  if (status != 200) throw Exception('http.get error: statusCode= $status');

  print(res.body);
}
