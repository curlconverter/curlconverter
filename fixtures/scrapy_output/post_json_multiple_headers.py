from scrapy import Request, Spider


class MySpider(Spider):
    name = 'myspider'

    def start_requests(self):
        headers = {
            'Content-Type': 'application/json',
            'X-API-Version': '200',
        }
        body = '{"userName":"username123","password":"password123", "authLoginDomain":"local"}'
        yield Request(
            'https://0.0.0.0/rest/login-sessions',
            callback=self.parse,
            method='POST',
            headers=headers,
            body=body,
        )

    def parse(self, response):
        pass

# To disable SSL certificate verification, see:
# https://stackoverflow.com/a/32951168
