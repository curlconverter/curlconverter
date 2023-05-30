import 'package:http/http.dart' as http;

void main() async {
  final headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  final data = '18233982904';

  final url = Uri.parse('http://localhost:28139/CurlToNode');

  final res = await http.post(url, headers: headers, body: data);
  final status = res.statusCode;
  if (status != 200) throw Exception('http.post error: statusCode= $status');

  print(res.body);
}
