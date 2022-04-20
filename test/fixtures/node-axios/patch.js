const axios = require('axios');

const response = await axios.patch('http://localhost:28139/go/api/agents/adb9540a-b954-4571-9d9b-2f330739d4da', {
    headers: {
        'Accept': 'application/vnd.go.cd.v4+json',
        'Content-Type': 'application/json'
    },
    auth: {
        username: 'username',
        password: 'password'
    },
    data: '{\n        "hostname": "agent02.example.com",\n        "agent_config_state": "Enabled",\n        "resources": ["Java","Linux"],\n        "environments": ["Dev"]\n        }'
});
