require 'httparty'

url = 'http://localhost:28139/wp-json/contact-form-7/v1/contact-forms/295/feedback'
headers = {
  'authority': 'sgg.ae',
  'accept': 'application/json, text/javascript, */*; q=0.01',
  'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
  'content-type': 'multipart/form-data; boundary=----WebKitFormBoundaryXSzdE07OT2MkeOO7',
  'cookie': 'pll_language=en',
  'origin': 'https://sgg.ae',
  'referer': 'https://sgg.ae/contact-us/',
  'sec-ch-ua': '"Chromium";v="106", "Google Chrome";v="106", "Not;A=Brand";v="99"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-origin',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
  'x-requested-with': 'XMLHttpRequest',
}
body = "------WebKitFormBoundaryXSzdE07OT2MkeOO7\r\nContent-Disposition: form-data; name=\"_wpcf7\"\r\n\r\n295\r\n------WebKitFormBoundaryXSzdE07OT2MkeOO7\r\nContent-Disposition: form-data; name=\"_wpcf7_version\"\r\n\r\n5.1.4\r\n------WebKitFormBoundaryXSzdE07OT2MkeOO7\r\nContent-Disposition: form-data; name=\"_wpcf7_locale\"\r\n\r\nen_US\r\n------WebKitFormBoundaryXSzdE07OT2MkeOO7\r\nContent-Disposition: form-data; name=\"_wpcf7_unit_tag\"\r\n\r\nwpcf7-f295-o1\r\n------WebKitFormBoundaryXSzdE07OT2MkeOO7\r\nContent-Disposition: form-data; name=\"_wpcf7_container_post\"\r\n\r\n0\r\n------WebKitFormBoundaryXSzdE07OT2MkeOO7\r\nContent-Disposition: form-data; name=\"your-name\"\r\n\r\ntest\r\n------WebKitFormBoundaryXSzdE07OT2MkeOO7\r\nContent-Disposition: form-data; name=\"your-email\"; filename=hhhhhhhh\r\n\r\nexample@example.com\r\n------WebKitFormBoundaryXSzdE07OT2MkeOO7\r\nContent-Disposition: form-data; name=\"your-subject\"\r\n\r\ntest\r\n------WebKitFormBoundaryXSzdE07OT2MkeOO7\r\nContent-Disposition: form-data; name=\"your-message\"\r\n\r\ntest\r\n------WebKitFormBoundaryXSzdE07OT2MkeOO7\r\nContent-Disposition: form-data; name=\"send_c[]\"\r\n\r\nSend copy to yourself\r\n------WebKitFormBoundaryXSzdE07OT2MkeOO7--\r\n"
res = HTTParty.post(url, headers: headers, body: body)
