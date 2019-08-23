import 'package:http/http.dart' as http;

void main() async {
  var data = 'a=b&c=d&e=f&h=i&j=k&l=m';

  var res = await http.post('http://www.url.com/page', body: data);
  if (res.statusCode != 200) throw Exception('post error: statusCode= ${res.statusCode}');
  print(res.body);
}
