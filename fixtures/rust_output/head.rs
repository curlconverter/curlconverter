extern crate reqwest;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let res = reqwest::Client::new()
        .head("http://www.url.com/page")
        .send()?
        .text()?;
    println!("{}", res);

    Ok(())
}
