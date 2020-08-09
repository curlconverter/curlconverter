const ansibleTemplate = `-
  name: '{{ request.urlWithoutQuery }}'
  uri:
    url: '{{ request.url }}'
    method: {{ request.method | upper }}
{%- if (request.data | isString) or (request.data | isNumber) %}
    body:
      {{ data | dump }}
    {%- if request.data | isNumber %}
    body_format: raw
    {%- else %}
    body_format: json
    {%- endif %}
{%- endif %}
{%- if request.headers %}
    headers:
    {%- for key, value in request.headers %}
      {{ key }}: '{{ value }}'
    {%- endfor %}
    {%- if request.cookieString %}
      Cookie: '{{ request.cookieString }}'
    {%- endif %}
{%- endif %}
{%- if request.auth %}
    {%- set url_username = request.auth.split(":")[0] %}
    {%- set url_password = request.auth.split(":")[1] %}
    {%- if url_username %}
    url_username: {{ url_username }}
    {%- endif %}
    {%- if url_password %}
    url_password: {{ url_password }}
    {%- endif %}
{%- endif %}
{%- if request.insecure %}
    validate_certs: no
{%- endif %}
  register: result
`

module.exports = ansibleTemplate
