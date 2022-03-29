import * as util from '../util.js'
import jsesc from 'jsesc'

export const _toGo = request => {
  let goCode = 'package main\n\n'
  goCode += 'import (\n\t"fmt"\n\t"io/ioutil"\n\t"log"\n\t"net/http"\n)\n\n'
  goCode += 'func main() {\n'
  goCode += '\tclient := &http.Client{}\n'
  if (request.data) {
    if (request.data.indexOf("'") > -1) {
      request.data = jsesc(request.data)
    }
    // import strings
    goCode = goCode.replace('\n)', '\n\t"strings"\n)')
    goCode += '\tvar data = strings.NewReader(`' + request.data + '`)\n'
    goCode += '\treq, err := http.NewRequest("' + request.method + '", "' + request.url + '", data)\n'
  } else {
    goCode += '\treq, err := http.NewRequest("' + request.method + '", "' + request.url + '", nil)\n'
  }
  goCode += '\tif err != nil {\n\t\tlog.Fatal(err)\n\t}\n'
  if (request.headers) {
    for (const [headerName, headerValue] of (request.headers || [])) {
      goCode += '\treq.Header.Set("' + headerName + '", "' + headerValue + '")\n'
    }
  }

  if (request.auth) {
    const [user, password] = request.auth
    goCode += '\treq.SetBasicAuth("' + user + '", "' + password + '")\n'
  }
  goCode += '\tresp, err := client.Do(req)\n'
  goCode += '\tif err != nil {\n'
  goCode += '\t\tlog.Fatal(err)\n'
  goCode += '\t}\n'
  goCode += '\tdefer resp.Body.Close()\n'
  goCode += '\tbodyText, err := ioutil.ReadAll(resp.Body)\n'
  goCode += '\tif err != nil {\n'
  goCode += '\t\tlog.Fatal(err)\n'
  goCode += '\t}\n'
  goCode += '\tfmt.Printf("%s\\n", bodyText)\n'
  goCode += '}'

  return goCode + '\n'
}
export const toGo = curlCommand => {
  const request = util.parseCurlCommand(curlCommand)
  return _toGo(request)
}
