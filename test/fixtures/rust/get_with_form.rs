extern crate reqwest;
use reqwest::blocking::multipart;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let form = multipart::Form::new()
        .text("from", "test@tester.com")
        .text("to", "devs@tester.net")
        .text("subject", "Hello")
        .text("text", "Testing the converter!");

    let res = reqwest::blocking::Client::new()
        .post("http://localhost:28139/v3")
        .basic_auth("test", Some(""))
        .multipart(form)
        .send()?
        .text()?;
    println!("{}", res);

    Ok(())
}
