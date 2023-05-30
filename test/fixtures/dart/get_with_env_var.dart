import 'dart:io';
import 'package:http/http.dart' as http;

void main() async {
  final headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + (Platform.environment['DO_API_TOKEN'] ?? ''),
  };

  final params = {
    'type': 'distribution',
  };

  final url = Uri.parse('http://localhost:28139/v2/images')
      .replace(queryParameters: params);

  final res = await http.get(url, headers: headers);
  final status = res.statusCode;
  if (status != 200) throw Exception('http.get error: statusCode= $status');

  print(res.body);
}
