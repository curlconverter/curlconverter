import requests

cookies = {
    'pll_language': 'en',
}

headers = {
    'authority': 'sgg.ae',
    'accept': 'application/json, text/javascript, */*; q=0.01',
    'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
    'content-type': 'multipart/form-data; boundary=----WebKitFormBoundaryXSzdE07OT2MkeOO7',
    # 'cookie': 'pll_language=en',
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

files = {
    '_wpcf7': (None, '295'),
    '_wpcf7_version': (None, '5.1.4'),
    '_wpcf7_locale': (None, 'en_US'),
    '_wpcf7_unit_tag': (None, 'wpcf7-f295-o1'),
    '_wpcf7_container_post': (None, '0'),
    'your-name': (None, 'test'),
    'your-email': ('hhhhhhhh', 'example@example.com'),
    'your-subject': (None, 'test'),
    'your-message': (None, 'test'),
    'send_c[]': (None, 'Send copy to yourself'),
}

response = requests.post(
    'http://localhost:28139/wp-json/contact-form-7/v1/contact-forms/295/feedback',
    cookies=cookies,
    headers=headers,
    files=files,
)
