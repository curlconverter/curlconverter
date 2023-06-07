let xhr = new XMLHttpRequest();
xhr.withCredentials = true;
xhr.open('PUT', 'http://localhost:28139/v2/alerts_policy_channels.json?policy_id=policy_id&channel_ids=channel_id');
xhr.setRequestHeader('X-Api-Key', '{admin_api_key}');
xhr.setRequestHeader('Content-Type', 'application/json');

xhr.onload = function() {
  console.log(xhr.response);
};

xhr.send();
