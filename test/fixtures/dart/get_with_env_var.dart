import 'dart:io';
import 'package:http/http.dart' as http;

void main() async {
  var headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + (Platform.environment['DO_API_TOKEN'] ?? ''),
  };

  var url = Uri.parse('http://localhost:28139/v2/images?type=distribution');
  var res = await http.get(url, headers: headers);
  if (res.statusCode != 200) throw Exception('http.get error: statusCode= ${res.statusCode}');
  print(res.body);
}
