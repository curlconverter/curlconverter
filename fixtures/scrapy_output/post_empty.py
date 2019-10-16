from scrapy import Request, Spider


class MySpider(Spider):
    name = 'myspider'

    def start_requests(self):
        yield Request(
            'http://google.com',
            callback=self.parse,
            method='POST',
        )

    def parse(self, response):
        pass
