package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
)

func main() {
	client := &http.Client{}
	req, err := http.NewRequest("GET", "http://localhost:28139/?format=json&", nil)
	if err != nil {
		log.Fatal(err)
	}
	req.Header.Set("Host", "api.ipify.org")
	req.Header.Set("Accept", "*/*")
	req.Header.Set("User-Agent", "GiftTalk/2.7.2 (iPhone; iOS 9.0.2; Scale/3.00)")
	req.Header.Set("Accept-Language", "en-CN;q=1, zh-Hans-CN;q=0.9")
	resp, err := client.Do(req)
	if err != nil {
		log.Fatal(err)
	}
	defer resp.Body.Close()
	bodyText, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("%s\n", bodyText)
}
