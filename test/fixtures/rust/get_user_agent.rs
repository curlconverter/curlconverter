use reqwest::header;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut headers = header::HeaderMap::new();
    headers.insert("x-msisdn", "XXXXXXXXXXXXX".parse()?);
    headers.insert("user-agent", "Mozilla Android6.1".parse()?);

    let client = reqwest::blocking::Client::new();
    let res = client.get("http://localhost:28139/vc/moviesmagic?p=5&pub=testmovie&tkn=817263812")
        .headers(headers)
        .send()?
        .text()?;
    println!("{}", res);

    Ok(())
}
