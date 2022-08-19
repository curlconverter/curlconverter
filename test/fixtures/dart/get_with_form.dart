import 'dart:convert';
import 'package:http/http.dart' as http;

void main() async {
  var uname = 'test';
  var pword = '';
  var authn = 'Basic ' + base64Encode(utf8.encode('$uname:$pword'));

  var url = Uri.parse('http://localhost:28139/v3');
  var req = new http.MultipartRequest('POST', url)
    ..fields['from'] = 'test@tester.com'
    ..fields['to'] = 'devs@tester.net'
    ..fields['subject'] = 'Hello'
    ..fields['text'] = 'Testing the converter!'
  req.headers['Authorization'] = authn;
  var res = await req.send();
  if (res.statusCode != 200) throw Exception('http.post error: statusCode= ${res.statusCode}');
  print(res.body);
}
