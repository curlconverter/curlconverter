import 'package:http/http.dart' as http;

void main() async {
  var headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  var data = 'foo=\'bar\'';

  var url = Uri.parse('http://localhost:28139/');
  var res = await http.post(url, headers: headers, body: data);
  if (res.statusCode != 200) throw Exception('http.post error: statusCode= ${res.statusCode}');
  print(res.body);
}
