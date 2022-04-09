import 'dart:convert';
import 'package:http/http.dart' as http;

void main() async {
  var uname = 'admin';
  var pword = '123';
  var authn = 'Basic ' + base64Encode(utf8.encode('$uname:$pword'));

  var headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': authn,
  };

  var data = '{"admins":{"names":[], "roles":[]}, "readers":{"names":["joe"],"roles":[]}}';

  var url = Uri.parse('http://localhost:28139/test/_security');
  var res = await http.put(url, headers: headers, body: data);
  if (res.statusCode != 200) throw Exception('http.put error: statusCode= ${res.statusCode}');
  print(res.body);
}
