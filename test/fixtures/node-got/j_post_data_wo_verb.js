import got from 'got';

const response = await got.post('http://localhost:28139/post', {
  form: {
    'data1': 'data1',
    'data2': 'data2',
    'data3': 'data3'
  }
});
