from scrapy import Request, Spider


class MySpider(Spider):
    name = 'myspider'

    def start_requests(self):
        headers = {
            'Pragma': 'no-cache',
            'Access-Control-Request-Method': 'POST',
            'Origin': 'https://alexa.amazon.de',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'de-DE,de;q=0.8,en-US;q=0.6,en;q=0.4',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
            'Accept': '*/*',
            'Cache-Control': 'no-cache',
            'Referer': 'https://alexa.amazon.de/spa/index.html',
            'Connection': 'keep-alive',
            'DNT': '1',
            'Access-Control-Request-Headers': 'content-type,csrf',
        }
        yield Request(
            'https://layla.amazon.de/api/tunein/queue-and-play?deviceSerialNumber=xxx^&deviceType=xxx^&guideId=s56876^&contentType=station^&callSign=^&mediaOwnerCustomerId=xxx',
            callback=self.parse,
            method='OPTIONS',
            headers=headers,
        )

    def parse(self, response):
        pass
