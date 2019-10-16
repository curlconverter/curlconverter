from scrapy import FormRequest, Spider


class MySpider(Spider):
    name = 'myspider'

    def start_requests(self):
        formdata = {
            'd1': 'data1',
            'd2': 'data',
        }
        yield FormRequest(
            'http://httpbin.org/post',
            formdata=formdata,
            callback=self.parse,
        )

    def parse(self, response):
        pass
