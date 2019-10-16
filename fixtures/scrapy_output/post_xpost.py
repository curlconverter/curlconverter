from scrapy import Request, Spider


class MySpider(Spider):
    name = 'myspider'

    def start_requests(self):
        body = '{"keywords":"php","page":1,"searchMode":1}'
        yield Request(
            'http://us.jooble.org/api/xxxxxxxxxxxxxxxx',
            callback=self.parse,
            method='POST',
            body=body,
        )

    def parse(self, response):
        pass
