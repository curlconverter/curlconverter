from scrapy import FormRequest, Spider


class MySpider(Spider):
    name = 'myspider'

    def start_requests(self):
        formdata = {
            'file1': './fixtures/curl_commands/delete.txt',
        }
        body = {
            'data1': 'data1',
            'data2': 'data2',
            'data3': 'data3',
        }
        body = '&'.join(key + '=' + value for key, value in body.items())
        yield FormRequest(
            'http://httpbin.org/post',
            formdata=formdata,
            callback=self.parse,
            body=body,
        )

    def parse(self, response):
        pass
