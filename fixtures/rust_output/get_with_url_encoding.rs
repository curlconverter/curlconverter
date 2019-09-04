extern crate reqwest;

fn main() -> Result<(), reqwest::Error> {

    let res = reqwest::Client::new()
        .post("http://example.com")
        .body("data=1&text=%D2%D4")
        .send()?
        .text()?;
    println!("{}", res);

    Ok(())
}
