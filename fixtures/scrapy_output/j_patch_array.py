from scrapy import Request, Spider


class MySpider(Spider):
    name = 'myspider'

    def start_requests(self):
        body = [
            ('item[]', '1'),
            ('item[]', '2'),
            ('item[]', '3'),
        ]
        body = '&'.join(key + '=' + value for key, value in body)
        yield Request(
            'http://httpbin.org/patch',
            callback=self.parse,
            method='PATCH',
            body=body,
        )

    def parse(self, response):
        pass
