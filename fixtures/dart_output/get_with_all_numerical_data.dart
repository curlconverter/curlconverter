import 'package:http/http.dart' as http;

void main() async {
  var headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  var data = '18233982904';

  var res = await http.post('http://198.30.191.00:8309/CurlToNode', headers: headers, body: data);
  if (res.statusCode != 200) throw Exception('post error: statusCode= ${res.statusCode}');
  print(res.body);
}
