const util = require('../util')
const jsesc = require('jsesc')

const toGo = curlCommand => {
  const request = util.parseCurlCommand(curlCommand)
  let goCode = 'package main\n\n'
  goCode += 'import (\n\t"fmt"\n\t"io/ioutil"\n\t"log"\n\t"net/http"\n)\n\n'
  goCode += 'func main() {\n'
  goCode += '\tclient := &http.Client{}\n'
  if (request.data === true) {
    request.data = ''
  }
  if (request.data) {
    if (typeof request.data === 'number') {
      request.data = request.data.toString()
    }
    if (request.data.indexOf("'") > -1) {
      request.data = jsesc(request.data)
    }
    // import strings
    goCode = goCode.replace('\n)', '\n\t"strings"\n)')
    goCode += '\tvar data = strings.NewReader(`' + request.data + '`)\n'
    goCode += '\treq, err := http.NewRequest("' + request.method.toUpperCase() + '", "' + request.url + '", data)\n'
  } else {
    goCode += '\treq, err := http.NewRequest("' + request.method.toUpperCase() + '", "' + request.url + '", nil)\n'
  }
  goCode += '\tif err != nil {\n\t\tlog.Fatal(err)\n\t}\n'
  if (request.headers || request.cookies) {
    for (const headerName in request.headers) {
      goCode += '\treq.Header.Set("' + headerName + '", "' + request.headers[headerName] + '")\n'
    }
    if (request.cookies) {
      const cookieString = util.serializeCookies(request.cookies)
      goCode += '\treq.Header.Set("Cookie", "' + cookieString + '")\n'
    }
  }

  if (request.auth) {
    const splitAuth = request.auth.split(':')
    const user = splitAuth[0] || ''
    const password = splitAuth[1] || ''
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

module.exports = toGo
