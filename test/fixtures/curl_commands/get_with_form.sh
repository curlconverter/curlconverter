curl -s --user 'test' \
  https://api.net/v3 \
  -F from='test@tester.com' \
  -F to='devs@tester.net' \
  -F subject='Hello' \
  -F text='Testing the converter!'
