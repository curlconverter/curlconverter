from scrapy import Request, Spider


class MySpider(Spider):
    name = 'myspider'

    def start_requests(self):
        body = {
            'version': '1.2',
            'auth_user': 'fdgxf',
            'auth_pwd': 'oxfdscds',
            'json_data': '{ "operation": "core/get", "class": "Software", "key": "key" }',
        }
        body = '&'.join(key + '=' + value for key, value in body.items())
        yield Request(
            'https://cmdb.litop.local/webservices/rest.php',
            callback=self.parse,
            method='POST',
            body=body,
        )

    def parse(self, response):
        pass
