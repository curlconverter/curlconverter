import 'dart:convert';
import 'package:http/http.dart' as http;

void main() async {
  final uname = '';
  final pword = 'some_password';
  final authn = 'Basic ${base64Encode(utf8.encode('$uname:$pword'))}';

  final url = Uri.parse('http://localhost:28139/');

  final res = await http.get(url, headers: {'Authorization': authn});
  final status = res.statusCode;
  if (status != 200) throw Exception('http.get error: statusCode= $status');

  print(res.body);
}
