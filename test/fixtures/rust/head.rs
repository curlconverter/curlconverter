fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = reqwest::blocking::Client::builder()
        .redirect(reqwest::redirect::Policy::none())
        .build()?;
    let res = client.head("http://localhost:28139/page")
        .send()?
        .text()?;
    println!("{}", res);

    Ok(())
}
