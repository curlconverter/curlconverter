import 'package:http/http.dart' as http;

void main() async {
  var headers = {
    'foo': 'bar',
  };

  var res = await http.get('http://example.com/', headers: headers);
  if (res.statusCode != 200) throw Exception('get error: statusCode= ${res.statusCode}');
  print(res.body);
}
