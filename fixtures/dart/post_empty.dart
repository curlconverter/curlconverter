import 'dart:convert';
import 'package:http/http.dart' as http;

void main() async {
  var headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  var res = await http.post('http://localhost:28139', headers: headers);
  if (res.statusCode != 200) throw Exception('http.post error: statusCode= ${res.statusCode}');
  print(res.body);
}
