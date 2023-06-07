import 'package:http/http.dart' as http;

void main() async {
  final headers = {
    'Content-Type': 'application/json',
  };

  final data = '{"properties": {"email": {"type": "keyword"}}}';

  final url = Uri.parse('http://localhost:28139/twitter/_mapping/user?pretty');

  final res = await http.put(url, headers: headers, body: data);
  final status = res.statusCode;
  if (status != 200) throw Exception('http.put error: statusCode= $status');

  print(res.body);
}
