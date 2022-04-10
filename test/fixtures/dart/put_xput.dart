import 'package:http/http.dart' as http;

void main() async {
  var headers = {
    'Content-Type': 'application/json',
  };

  var data = '{"properties": {"email": {"type": "keyword"}}}';

  var url = Uri.parse('http://localhost:28139/twitter/_mapping/user?pretty');
  var res = await http.put(url, headers: headers, body: data);
  if (res.statusCode != 200) throw Exception('http.put error: statusCode= ${res.statusCode}');
  print(res.body);
}
