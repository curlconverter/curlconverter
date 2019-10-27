extern crate reqwest;
use reqwest::{header, multipart};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut headers = header::HeaderMap::new();
    headers.insert("Authorization", "Bearer ACCESS_TOKEN".parse().unwrap());
    headers.insert("X-Nice", "Header".parse().unwrap());

    let form = multipart::Form::new()
        .text("attributes", "{\"name\":\"tigers.jpeg\", \"parent\":{\"id\":\"11446498\"}}")
        .file("file", "myfile.jpg")?;

    let res = reqwest::Client::new()
        .post("https://upload.box.com/api/2.0/files/content")
        .headers(headers)
        .multipart(form)
        .send()?
        .text()?;
    println!("{}", res);

    Ok(())
}
