extern crate reqwest;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = reqwest::blocking::Client::builder()
        .redirect(reqwest::redirect::Policy::none())
        .build()
        .unwrap();
    let res = client.delete("http://localhost:28139/page")
        .send()?
        .text()?;
    println!("{}", res);

    Ok(())
}
