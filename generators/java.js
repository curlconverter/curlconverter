const util = require('../util')
const jsesc = require('jsesc')

const doubleQuotes = str => jsesc(str, { quotes: 'double' })

const toJava = curlCommand => {
  const request = util.parseCurlCommand(curlCommand)
  let javaCode = ''

  if (request.auth) {
    javaCode += 'import javax.xml.bind.DatatypeConverter;\n'
  }
  javaCode += 'import java.io.IOException;\n'
  javaCode += 'import java.io.InputStream;\n'
  if (request.data) {
    javaCode += 'import java.io.OutputStreamWriter;\n'
  }

  javaCode += 'import java.net.HttpURLConnection;\n'

  javaCode += 'import java.net.URL;\n'
  javaCode += 'import java.util.Scanner;\n'

  javaCode += '\nclass Main {\n\n'

  request.url = request.url.replace(/(^\\')|(\\'$)|(')/g, '')
  if (request.url.indexOf('"') !== 0) {
    request.url = '"' + request.url
  }
  if (request.url.lastIndexOf('"') === 0) {
    request.url = request.url + '"'
  }

  javaCode += '\tpublic static void main(String[] args) throws IOException {\n'
  javaCode += '\t\tURL url = new URL(' + request.url + ');\n'
  javaCode += '\t\tHttpURLConnection httpConn = (HttpURLConnection) url.openConnection();\n'
  javaCode += '\t\thttpConn.setRequestMethod("' + request.method.toUpperCase() + '");\n\n'

  if (request.headers) {
    for (const headerName in request.headers) {
      javaCode += '\t\thttpConn.setRequestProperty("' + headerName + '", "' + doubleQuotes(request.headers[headerName]) + '");\n'
    }
    javaCode += '\n'
  }

  if (request.cookies) {
    const cookieString = util.serializeCookies(request.cookies)
    javaCode += '\t\thttpConn.setRequestProperty("Cookie", "' + cookieString + '");\n'
    javaCode += '\n'
  }

  if (request.auth) {
    javaCode += '\t\tbyte[] message = ("' + request.auth + '").getBytes("UTF-8");\n'
    javaCode += '\t\tString basicAuth = DatatypeConverter.printBase64Binary(message);\n'
    javaCode += '\t\thttpConn.setRequestProperty("Authorization", "Basic " + basicAuth);\n'
    javaCode += '\n'
  }

  if (request.data) {
    if (typeof request.data === 'number') {
      request.data = request.data.toString()
    }
    if (request.data.match(/"(?:[^"\\]|\\.)*"/) != null) {
      request.data = doubleQuotes(request.data)
    }
    javaCode += '\t\thttpConn.setDoOutput(true);\n'
    javaCode += '\t\tOutputStreamWriter writer = new OutputStreamWriter(httpConn.getOutputStream());\n'
    javaCode += '\t\twriter.write("' + request.data + '");\n'
    javaCode += '\t\twriter.flush();\n'
    javaCode += '\t\twriter.close();\n'
    javaCode += '\t\thttpConn.getOutputStream().close();\n'
    javaCode += '\n'
  }

  javaCode += '\t\tInputStream responseStream = httpConn.getResponseCode() / 100 == 2\n'
  javaCode += '\t\t\t\t? httpConn.getInputStream()\n'
  javaCode += '\t\t\t\t: httpConn.getErrorStream();\n'
  javaCode += '\t\tScanner s = new Scanner(responseStream).useDelimiter("\\\\A");\n'
  javaCode += '\t\tString response = s.hasNext() ? s.next() : "";\n'
  javaCode += '\t\tSystem.out.println(response);\n'

  javaCode += '\t}\n'
  javaCode += '}'

  return javaCode + '\n'
}

module.exports = toJava
