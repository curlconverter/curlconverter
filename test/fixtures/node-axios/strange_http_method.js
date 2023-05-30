import axios from 'axios';

const response = await axios('http://localhost:28139', {
  method: 'what'
});
