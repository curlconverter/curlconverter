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
	fw, err := writer.CreateFormFile("files", filepath.Base("47.htz"))
	if err != nil {
		log.Fatal(err)
	}
	fd, err := os.Open("47.htz")
	if err != nil {
		log.Fatal(err)
	}
	defer fd.Close()
	_, err = io.Copy(fw, fd)
	if err != nil {
		log.Fatal(err)
	}

	formField, err := writer.CreateFormField("name")
	if err != nil {
		log.Fatal(err)
	}
	_, err = formField.Write([]byte("47"))

	formField, err = writer.CreateFormField("oldMediaId")
	if err != nil {
		log.Fatal(err)
	}
	_, err = formField.Write([]byte("47"))

	formField, err = writer.CreateFormField("updateInLayouts")
	if err != nil {
		log.Fatal(err)
	}
	_, err = formField.Write([]byte("1"))

	formField, err = writer.CreateFormField("deleteOldRevisions")
	if err != nil {
		log.Fatal(err)
	}
	_, err = formField.Write([]byte("1"))

	writer.Close()

	client := &http.Client{}
	req, err := http.NewRequest("POST", "http://localhost:28139/api/library", form)
	if err != nil {
		log.Fatal(err)
	}
	req.Header.Set("accept", "application/json")
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
