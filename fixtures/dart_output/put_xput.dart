import 'package:http/http.dart' as http;

void main() async {
  var headers = {
    'Content-Type': 'application/json',
  };

  var data = '{"properties": {"email": {"type": "keyword"}}}';

  var res = await http.put('http://localhost:9200/twitter/_mapping/user?pretty', headers: headers, body: data);
  if (res.statusCode != 200) throw Exception('put error: statusCode= ${res.statusCode}');
  print(res.body);
}
