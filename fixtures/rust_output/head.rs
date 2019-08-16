extern crate reqwest;

fn main() -> Result<(), reqwest::Error> {

    let res = reqwest::Client::new()
        .head("http://www.url.com/page")
        .send()?
        .text()?;
    println!("{}", res);

    Ok(())
}
