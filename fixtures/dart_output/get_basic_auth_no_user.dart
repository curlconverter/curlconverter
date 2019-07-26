import 'dart:convert' as convert;
import 'package:http/http.dart' as http;

void main() async {
  var headers = Map<String, String>();
  var uname = '';
  var pword = 'some_password';
  headers['Authentication'] = 'Basic ' + convert.base64Encode(convert.utf8.encode('$uname:$pword'));

  var res = await http.get('https://api.test.com/', headers: headers);
  if (res.statusCode != 200) throw Exception('get error: statusCode= ${res.statusCode}');
}
