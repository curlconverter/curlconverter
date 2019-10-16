from scrapy import Request, Spider


class MySpider(Spider):
    name = 'myspider'

    def start_requests(self):
        headers = {
            'Content-Type': 'application/json',
            'key': 'abcdefg',
        }
        yield Request(
            'http://1.2.3.4/endpoint',
            callback=self.parse,
            method='POST',
            headers=headers,
        )

    def parse(self, response):
        pass
