import got from 'got';

const response = await got('http://localhost:28139/get', {
  headers: {
    'Content-Type': 'text/xml;charset=UTF-8',
    'getWorkOrderCancel': ''
  }
});
