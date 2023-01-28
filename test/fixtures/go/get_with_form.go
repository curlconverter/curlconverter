package main

import (
	"bytes"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"
)

func main() {
	form := new(bytes.Buffer)
	writer := multipart.NewWriter(form)
	formField, err := writer.CreateFormField("from")
	if err != nil {
		log.Fatal(err)
	}
	_, err = formField.Write([]byte("test@tester.com"))

	formField, err = writer.CreateFormField("to")
	if err != nil {
		log.Fatal(err)
	}
	_, err = formField.Write([]byte("devs@tester.net"))

	formField, err = writer.CreateFormField("subject")
	if err != nil {
		log.Fatal(err)
	}
	_, err = formField.Write([]byte("Hello"))

	formField, err = writer.CreateFormField("text")
	if err != nil {
		log.Fatal(err)
	}
	_, err = formField.Write([]byte("Testing the converter!"))

	writer.Close()

	client := &http.Client{}
	req, err := http.NewRequest("POST", "http://localhost:28139/v3", form)
	if err != nil {
		log.Fatal(err)
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())
	req.SetBasicAuth("test", "")
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
