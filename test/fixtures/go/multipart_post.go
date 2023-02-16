package main

import (
	"bytes"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
)

func main() {
	form := new(bytes.Buffer)
	writer := multipart.NewWriter(form)
	formField, err := writer.CreateFormField("attributes")
	if err != nil {
		log.Fatal(err)
	}
	_, err = formField.Write([]byte(`{"name":"tigers.jpeg", "parent":{"id":"11446498"}}`))

	fw, err := writer.CreateFormFile("file", filepath.Base("myfile.jpg"))
	if err != nil {
		log.Fatal(err)
	}
	fd, err := os.Open("myfile.jpg")
	if err != nil {
		log.Fatal(err)
	}
	defer fd.Close()
	_, err = io.Copy(fw, fd)
	if err != nil {
		log.Fatal(err)
	}

	writer.Close()

	client := &http.Client{}
	req, err := http.NewRequest("POST", "http://localhost:28139/api/2.0/files/content", form)
	if err != nil {
		log.Fatal(err)
	}
	req.Header.Set("Authorization", "Bearer ACCESS_TOKEN")
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
