from scrapy import Request, Spider


class MySpider(Spider):
    name = 'myspider'

    def start_requests(self):
        headers = {
            'Content-Type': 'application/json',
        }
        body = '{"properties": {"email": {"type": "keyword"}}}'
        yield Request(
            'http://localhost:9200/twitter/_mapping/user?pretty',
            callback=self.parse,
            method='PUT',
            headers=headers,
            body=body,
        )

    def parse(self, response):
        pass
