import 'dart:convert' as convert;
import 'package:http/http.dart' as http;

void main() async {
  var uname = 'some_username';
  var pword = 'some_password';
  var authn = 'Basic ' + convert.base64Encode(convert.utf8.encode('$uname:$pword'));

  var res = await http.get('https://api.test.com/', headers: {'authorization': authn});
  if (res.statusCode != 200) throw Exception('get error: statusCode= ${res.statusCode}');
  print(res.body);
}
