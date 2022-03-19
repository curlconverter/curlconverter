import 'package:http/http.dart' as http;

void main() async {
  var data = 'foo=\'bar\'';

  var url = Uri.parse('http://example.com/');
  var res = await http.post(url, body: data);
  if (res.statusCode != 200) throw Exception('http.post error: statusCode= ${res.statusCode}');
  print(res.body);
}
