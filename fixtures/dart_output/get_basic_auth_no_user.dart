import 'dart:convert';
import 'package:http/http.dart' as http;

void main() async {
  var uname = '';
  var pword = 'some_password';
  var authn = 'Basic ' + base64Encode(utf8.encode('$uname:$pword'));

  var res = await http.get('https://api.test.com/', headers: {'Authorization': authn});
  if (res.statusCode != 200) throw Exception('get error: statusCode= ${res.statusCode}');
  print(res.body);
}
