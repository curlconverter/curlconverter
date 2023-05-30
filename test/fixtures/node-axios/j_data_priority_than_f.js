import axios from 'axios';

const response = await axios.post(
  'http://localhost:28139/post',
  new URLSearchParams({
    'data1': 'data1',
    'data2': 'data2',
    'data3': 'data3'
  })
);
