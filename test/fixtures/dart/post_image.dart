import 'package:http/http.dart' as http;

void main() async {
  var url = Uri.parse('http://localhost:28139/targetservice');
  var res = await http.MultipartRequest('POST', url)
    ..files.add(await http.MultipartFile.fromPath(
      'image', 'image.jpg'))
  if (res.statusCode != 200) throw Exception('http.post error: statusCode= ${res.statusCode}');
  print(res.body);
}
