import 'package:http/http.dart' as http;

void main() async {
  var url = Uri.parse('http://localhost:28139/post');
  var res = await http.MultipartRequest('POST', url)
    ..fields['d1'] = 'data1'
    ..fields['d2'] = 'data'
  if (res.statusCode != 200) throw Exception('http.post error: statusCode= ${res.statusCode}');
  print(res.body);
}
