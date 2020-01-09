extern crate reqwest;
use reqwest::multipart;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let form = multipart::Form::new()
        .text("from", "test@tester.com")
        .text("to", "devs@tester.net")
        .text("subject", "Hello")
        .text("text", "Testing the converter!");

    let res = reqwest::Client::new()
        .post("https://api.net/v3")
        .basic_auth("test", Some(""))
        .multipart(form)
        .send()?
        .text()?;
    println!("{}", res);

    Ok(())
}
