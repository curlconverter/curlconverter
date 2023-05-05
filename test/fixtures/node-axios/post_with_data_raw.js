import axios from 'axios';

const response = await axios.post(
  'http://localhost:28139/post',
  'msg1=wow&msg2=such&msg3=@rawmsg',
  {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }
);
