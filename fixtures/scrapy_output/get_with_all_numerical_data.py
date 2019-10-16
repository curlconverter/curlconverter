from scrapy import Request, Spider


class MySpider(Spider):
    name = 'myspider'

    def start_requests(self):
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
        body = '18233982904'
        yield Request(
            'http://198.30.191.00:8309/CurlToNode',
            callback=self.parse,
            method='POST',
            headers=headers,
            body=body,
        )

    def parse(self, response):
        pass
