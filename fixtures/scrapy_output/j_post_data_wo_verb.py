from scrapy import Request, Spider


class MySpider(Spider):
    name = 'myspider'

    def start_requests(self):
        body = {
            'data1': 'data1',
            'data2': 'data2',
            'data3': 'data3',
        }
        body = '&'.join(key + '=' + value for key, value in body.items())
        yield Request(
            'http://httpbin.org/post',
            callback=self.parse,
            method='POST',
            body=body,
        )

    def parse(self, response):
        pass
