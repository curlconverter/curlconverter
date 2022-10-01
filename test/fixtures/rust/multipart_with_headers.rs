extern crate reqwest;
use reqwest::{header, blocking::multipart};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut headers = header::HeaderMap::new();
    headers.insert("Authorization", "Bearer ACCESS_TOKEN".parse().unwrap());
    headers.insert("X-Nice", "Header".parse().unwrap());

    let form = multipart::Form::new()
        .text("attributes", "{\"name\":\"tigers.jpeg\", \"parent\":{\"id\":\"11446498\"}}")
        .file("file", "myfile.jpg")?;

    let client = reqwest::blocking::Client::builder()
        .redirect(reqwest::redirect::Policy::none())
        .build()
        .unwrap();
    let res = client.post("http://localhost:28139/api/2.0/files/content")
        .headers(headers)
        .multipart(form)
        .send()?
        .text()?;
    println!("{}", res);

    Ok(())
}
