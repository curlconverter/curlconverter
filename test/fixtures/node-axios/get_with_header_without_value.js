import axios from 'axios';

const response = await axios.get('http://localhost:28139/get', {
  headers: {
    'Content-Type': 'text/xml;charset=UTF-8',
    'getWorkOrderCancel': ''
  }
});
