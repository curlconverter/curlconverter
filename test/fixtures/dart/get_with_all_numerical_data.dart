import 'package:http/http.dart' as http;

void main() async {
  var headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  var data = '18233982904';

  var url = Uri.parse('http://localhost:28139/CurlToNode');
  var res = await http.post(url, headers: headers, body: data);
  if (res.statusCode != 200) throw Exception('http.post error: statusCode= ${res.statusCode}');
  print(res.body);
}
