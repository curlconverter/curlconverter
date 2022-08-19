import 'package:http/http.dart' as http;

void main() async {
  var url = Uri.parse('http://localhost:28139/api/2.0/files/content');
  var req = new http.MultipartRequest('POST', url)
    ..fields['attributes'] = '{"name":"tigers.jpeg", "parent":{"id":"11446498"}}'
    ..files.add(await http.MultipartFile.fromPath(
      'file', 'myfile.jpg'))
  req.headers['Authorization'] = 'Bearer ACCESS_TOKEN';
  req.headers['X-Nice'] = 'Header';
  var res = await req.send();
  if (res.statusCode != 200) throw Exception('http.post error: statusCode= ${res.statusCode}');
  print(res.body);
}
