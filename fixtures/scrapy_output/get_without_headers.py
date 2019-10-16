from scrapy import Request, Spider


class MySpider(Spider):
    name = 'myspider'

    def start_requests(self):
        yield Request(
            'http://indeed.com',
            callback=self.parse,
        )

    def parse(self, response):
        pass
