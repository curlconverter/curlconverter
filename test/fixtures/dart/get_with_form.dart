import 'dart:convert';
import 'package:http/http.dart' as http;

void main() async {
  final uname = 'test';
  final pword = '';
  final authn = 'Basic ${base64Encode(utf8.encode('$uname:$pword'))}';

  final url = Uri.parse('http://localhost:28139/v3');

  final req = http.MultipartRequest('POST', url)
    ..fields['from'] = 'test@tester.com'
    ..fields['to'] = 'devs@tester.net'
    ..fields['subject'] = 'Hello'
    ..fields['text'] = 'Testing the converter!';

  req.headers['Authorization'] = authn;

  final stream = await req.send();
  final res = await http.Response.fromStream(stream);
  final status = res.statusCode;
  if (status != 200) throw Exception('http.send error: statusCode= $status');

  print(res.body);
}
