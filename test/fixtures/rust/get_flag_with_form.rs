use reqwest::blocking::multipart;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let form = multipart::Form::new()
        .text("name", "value");

    let client = reqwest::blocking::Client::builder()
        .redirect(reqwest::redirect::Policy::none())
        .build()?;
    let res = client.post("http://localhost:28139/upload")
        .multipart(form)
        .send()?
        .text()?;
    println!("{}", res);

    Ok(())
}
