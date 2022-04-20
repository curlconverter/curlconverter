const axios = require('axios');
const fs = require('fs');

const formData = new FormData();
formData.append('image', fs.readFileSync('image.jpg'), 'image.jpg');

const response = await axios.post('http://localhost:28139/targetservice', {
    data: formData
});
