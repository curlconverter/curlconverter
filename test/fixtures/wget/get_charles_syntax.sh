wget --header="Host: api.ipify.org" \
  --header="Accept: */*" \
  --header="User-Agent: GiftTalk/2.7.2 (iPhone; iOS 9.0.2; Scale/3.00)" \
  --header="Accept-Language: en-CN;q=1, zh-Hans-CN;q=0.9" \
  --compression=auto \
  --output-document - \
  "http://localhost:28139/?format=json&"
