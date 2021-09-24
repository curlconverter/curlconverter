import 'package:http/http.dart' as http;

void main() async {
  var headers = {
    'Content-Type': 'application/json',
  };

  var params = {
    'pretty': '',
  };
  var query = params.entries.map((p) => '${p.key}=${p.value}').join('&');

  var data = '{"properties": {"email": {"type": "keyword"}}}';

  var res = await http.put('http://localhost:9200/twitter/_mapping/user?$query', headers: headers, body: data);
  if (res.statusCode != 200) throw Exception('http.put error: statusCode= ${res.statusCode}');
  print(res.body);
}
