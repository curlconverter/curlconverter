const jsesc = require('jsesc')

const repr = (value) => {
  // In context of url parameters, don't accept nulls and such.
  if (!value) {
    return "''"
  }

  return "'" + jsesc(value, { quotes: 'single' }).replace(/\\'/g, "''") + "'"
}

const setVariableValue = (outputVariable, value, termination) => {
  let result = ''

  if (outputVariable) {
    result += outputVariable + ' = '
  }

  result += value
  result += typeof termination === 'undefined' || termination === null ? ';' : termination
  return result
}

const callFunction = (outputVariable, functionName, params, termination) => {
  let functionCall = functionName + '('
  if (Array.isArray(params)) {
    const singleLine = params.map(x => Array.isArray(x) ? x.join(', ') : x).join(', ')
    const indentLevel = 1
    const indent = ' '.repeat(4 * indentLevel)
    const skipToNextLine = '...\n' + indent
    let multiLine = skipToNextLine
    multiLine += params.map(x => Array.isArray(x) ? x.join(', ') : x)
      .join(',' + skipToNextLine)
    multiLine += '...\n'

    // Split the params in multiple lines - if one line is not enough
    const combinedSingleLineLength = [outputVariable, functionName, singleLine]
        .map(x => x ? x.length : 0).reduce((x, y) => x + y) +
      (outputVariable ? 3 : 0) + 2 + (termination ? termination.length : 1)
    functionCall += combinedSingleLineLength < 120 ? singleLine : multiLine
  } else {
    functionCall += params
  }
  functionCall += ')'
  return setVariableValue(outputVariable, functionCall, termination)
}

const addCellArray = (mapping, keysNotToQuote, keyValSeparator, indentLevel, pairs) => {
  const indentUnit = ' '.repeat(4)
  const indent = indentUnit.repeat(indentLevel)
  const indentPrevLevel = indentUnit.repeat(indentLevel - 1)

  const entries = Object.entries(mapping)
  if (entries.length === 0) return ''

  let response = pairs ? '' : '{'
  if (entries.length === 1) {
    let [key, value] = entries.pop()
    if (keysNotToQuote && !keysNotToQuote.includes(key)) value = `${repr(value)}`
    response += `${repr(key)}${keyValSeparator} ${value}`
  } else {
    if (pairs) response += '...'
    let counter = entries.length
    for (let [key, value] of entries) {
      --counter
      if (keysNotToQuote && !keysNotToQuote.includes(key)) {
        if (typeof value === 'object') {
          value = `[${value.map(repr).join()}]`
        } else {
          value = `${repr(value)}`
        }
      }
      response += `\n${indent}${repr(key)}${keyValSeparator} ${value}`
      if (pairs) {
        if (counter !== 0) response += ','
        response += '...'
      }
    }
    response += `\n${indentPrevLevel}`
  }
  response += pairs ? '' : '}'
  return response
}

const structify = (obj, indentLevel) => {
  let response = ''
  indentLevel = !indentLevel ? 1 : ++indentLevel
  const indent = ' '.repeat(4 * indentLevel)
  const prevIndent = ' '.repeat(4 * (indentLevel - 1))

  if (obj instanceof Array) {
    const list = []
    let listContainsNumbers = true
    for (const k in obj) {
      if (listContainsNumbers && typeof obj[k] !== 'number') {
        listContainsNumbers = false
      }
      const value = structify(obj[k], indentLevel)
      list.push(`${value}`)
    }
    if (listContainsNumbers) {
      const listString = list.join(' ')
      response += `[${listString}]`
    } else {
      list.unshift('{{')
      const listString = list.join(`\n${indent}`)
      response += `${listString}\n${prevIndent}}}`
    }
  } else if (obj instanceof Object) {
    response += 'struct(...'
    let first = true
    for (const k in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, k)) {
        if (!k[0].match(/[a-z]/i)) {
          throw Error('MATLAB structs do not support keys starting with non-alphabet symbols')
        }
        // recursive call to scan property
        if (first) { first = false } else {
          response += ',...'
        }
        response += `\n${indent}`
        response += `'${k}', `
        response += structify(obj[k], indentLevel)
      }
    }
    response += '...'
    response += `\n${prevIndent})`
  } else if (typeof obj === 'number') {
    // not an Object so obj[k] here is a value
    response += `${obj}`
  } else {
    response += `${repr(obj)}`
  }

  return response
}

const containsBody = (request) => {
  return request.data || request.multipartUploads
}

const prepareQueryString = (request) => {
  let response = null
  if (request.query) {
    const params = addCellArray(request.query, [], '', 1)
    response = setVariableValue('params', params)
  }
  return response
}

const prepareCookies = (request) => {
  let response = null
  if (request.cookies) {
    const cookies = addCellArray(request.cookies, [], '', 1)
    response = setVariableValue('cookies', cookies)
  }
  return response
}

const cookieString = 'char(join(join(cookies, \'=\'), \'; \'))'
const paramsString = 'char(join(join(params, \'=\'), \'&\'))'

module.exports = {
  repr: repr,
  setVariableValue: setVariableValue,
  callFunction: callFunction,
  addCellArray: addCellArray,
  structify: structify,
  containsBody: containsBody,
  prepareQueryString: prepareQueryString,
  prepareCookies: prepareCookies,
  cookieString: cookieString,
  paramsString: paramsString
}
