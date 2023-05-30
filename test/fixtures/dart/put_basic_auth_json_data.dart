import 'dart:convert';
import 'package:http/http.dart' as http;

void main() async {
  final uname = 'admin';
  final pword = '123';
  final authn = 'Basic ${base64Encode(utf8.encode('$uname:$pword'))}';

  final headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': authn,
  };

  final data = '{"admins":{"names":[], "roles":[]}, "readers":{"names":["joe"],"roles":[]}}';

  final url = Uri.parse('http://localhost:28139/test/_security');

  final res = await http.put(url, headers: headers, body: data);
  final status = res.statusCode;
  if (status != 200) throw Exception('http.put error: statusCode= $status');

  print(res.body);
}
