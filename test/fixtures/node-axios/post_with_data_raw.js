const axios = require('axios');

const response = await axios.post('http://localhost:28139/post', {
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: 'msg1=wow&msg2=such&msg3=@rawmsg'
});
