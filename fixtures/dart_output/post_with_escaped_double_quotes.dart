import 'package:http/http.dart' as http;

void main() async {
  var data = 'foo="bar"';

  var res = await http.post('http://example.com/', body: data);
  if (res.statusCode != 200) throw Exception('post error: statusCode= ${res.statusCode}');
  print(res.body);
}
