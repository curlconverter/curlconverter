import axios from 'axios';

const response = await axios.get('http://localhost:28139/', {
  auth: {
    username: 'some_username',
    password: 'some_password'
  }
});
