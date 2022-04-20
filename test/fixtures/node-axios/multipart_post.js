const axios = require('axios');
const fs = require('fs');

const formData = new FormData();
formData.append('attributes', '{"name":"tigers.jpeg", "parent":{"id":"11446498"}}');
formData.append('file', fs.readFileSync('myfile.jpg'), 'myfile.jpg');

const response = await axios.post('https://localhost:28139/api/2.0/files/content', {
    headers: {
        'Authorization': 'Bearer ACCESS_TOKEN'
    },
    data: formData
});
