from scrapy import Request, Spider


class MySpider(Spider):
    name = 'myspider'

    def start_requests(self):
        headers = {
            'Pragma': 'no-cache',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.119 Safari/537.36',
            'accept': 'application/json',
            'Referer': 'https://httpbin.org/',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache',
            'Sec-Metadata': 'destination=empty, site=same-origin',
        }
        cookies = {
            'authCookie': '123',
        }
        yield Request(
            'https://httpbin.org/cookies',
            callback=self.parse,
            headers=headers,
            cookies=cookies,
        )

    def parse(self, response):
        pass
