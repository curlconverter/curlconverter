import 'dart:convert';
import 'package:http/http.dart' as http;

void main() async {
  var uname = 'admin';
  var pword = '123';
  var authn = 'Basic ' + base64Encode(utf8.encode('$uname:$pword'));

  var headers = {
    'Authorization': authn,
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  var data = '{"admins":{"names":[], "roles":[]}, "readers":{"names":["joe"],"roles":[]}}';

  var res = await http.put('http://localhost:5984/test/_security', headers: headers, body: data);
  if (res.statusCode != 200) throw Exception('put error: statusCode= ${res.statusCode}');
  print(res.body);
}
