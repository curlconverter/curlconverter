extern crate reqwest;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let res = reqwest::Client::new()
        .delete("http://localhost:28139/page")
        .send()?
        .text()?;
    println!("{}", res);

    Ok(())
}
