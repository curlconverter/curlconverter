import 'package:http/http.dart' as http;

void main() async {
  var url = Uri.parse('http://localhost:28139/post-to-me.php');
  var res = await http.MultipartRequest('POST', url)
    ..fields['username'] = 'davidwalsh'
    ..fields['password'] = 'something'
  if (res.statusCode != 200) throw Exception('http.post error: statusCode= ${res.statusCode}');
  print(res.body);
}
