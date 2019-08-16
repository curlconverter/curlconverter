import 'dart:convert';
import 'package:http/http.dart' as http;

void main() async {
  var headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  var data = utf8.encode('{"title":"china1"}');

  var res = await http.post('http://example.com/post', headers: headers, body: data);
  if (res.statusCode != 200) throw Exception('post error: statusCode= ${res.statusCode}');
  print(res.body);
}
