export const ansibleTemplate = `-
  name: '{{ request.urlWithoutQuery }}'
  uri:
    url: '{{ request.url }}'
    method: {{ request.method | upper }}
{%- if (request.data | isString) and (request.data) %}
    body:
      {{ data | dump }}
    body_format: json
{%- endif %}
{%- if request.headers %}
    headers:
    {%- for key, value in request.headers %}
      {{ key }}: '{{ value }}'
    {%- endfor %}
{%- endif %}
{%- if request.auth %}
    {%- set url_username = request.auth[0] %}
    {%- set url_password = request.auth[1] %}
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
`;
