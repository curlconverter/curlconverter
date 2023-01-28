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
	formField, err := writer.CreateFormField("username")
	if err != nil {
		log.Fatal(err)
	}
	_, err = formField.Write([]byte("davidwalsh"))

	formField, err = writer.CreateFormField("password")
	if err != nil {
		log.Fatal(err)
	}
	_, err = formField.Write([]byte("something"))

	writer.Close()

	client := &http.Client{}
	req, err := http.NewRequest("POST", "http://localhost:28139/post-to-me.php", form)
	if err != nil {
		log.Fatal(err)
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())
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
