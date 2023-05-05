import axios from 'axios';

const response = await axios.get('http://localhost:28139/echo/html/', {
  headers: {
    'Origin': 'http://fiddle.jshell.net'
  },
  data: new URLSearchParams({
    'msg1': 'value1',
    'msg2': 'value2'
  })
});
