import axios from 'axios';

const response = await axios.post(
  'http://localhost:28139/',
  new URLSearchParams([
    ['foo', 'bar'],
    ['foo', ''],
    ['foo', 'barbar']
  ])
);
