extern crate reqwest;

fn main() -> Result<(), reqwest::Error> {

    let res = reqwest::Client::new()
        .delete("http://www.url.com/page")
        .send()?
        .text()?;
    println!("{}", res);

    Ok(())
}
