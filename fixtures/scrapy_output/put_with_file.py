from scrapy import Request, Spider


class MySpider(Spider):
    name = 'myspider'

    def start_requests(self):
        body = open('new_file').read()
        yield Request(
            'http://awesomeurl.com/upload',
            callback=self.parse,
            method='PUT',
            body=body,
        )

    def parse(self, response):
        pass
