use reqwest::{Client, Method};
use serde::{Deserialize, Serialize};
use std::time::Instant;

#[derive(Deserialize)]
pub struct RequestConfig {
    pub url: String,
    pub method: String,
    pub headers: std::collections::HashMap<String, String>,
    pub body: Option<String>,
    pub timeout: u64,
    pub follow_redirects: bool,
}

#[derive(Serialize)]
pub struct ResponseData {
    pub status: u16,
    pub status_text: String,
    pub headers: std::collections::HashMap<String, String>,
    pub body: String,
    pub timing: Timing,
    pub size: Size,
}

#[derive(Serialize)]
pub struct Timing {
    pub first_byte: u64,
    pub total: u64,
}

#[derive(Serialize)]
pub struct Size {
    pub headers: usize,
    pub body: usize,
}

#[tauri::command]
pub async fn execute_request(config: RequestConfig) -> Result<ResponseData, String> {
    let start = Instant::now();
    
    let method = match config.method.as_str() {
        "GET" => Method::GET,
        "POST" => Method::POST,
        "PUT" => Method::PUT,
        "DELETE" => Method::DELETE,
        "PATCH" => Method::PATCH,
        "HEAD" => Method::HEAD,
        "OPTIONS" => Method::OPTIONS,
        _ => return Err(format!("Invalid HTTP method: {}", config.method)),
    };
    
    let redirect_policy = if config.follow_redirects {
        reqwest::redirect::Policy::default()
    } else {
        reqwest::redirect::Policy::none()
    };

    let client = Client::builder()
        .timeout(std::time::Duration::from_millis(config.timeout))
        .redirect(redirect_policy)
        .build()
        .map_err(|e| e.to_string())?;
    
    let mut req = client.request(method, &config.url);
    
    // Add headers
    for (key, value) in &config.headers {
        req = req.header(key, value);
    }
    
    // Add body
    if let Some(body) = config.body {
        req = req.body(body);
    }
    
    let first_byte_time = start.elapsed().as_millis() as u64;
    
    let response = req.send().await.map_err(|e| e.to_string())?;
    let status = response.status();
    
    // Collect headers
    let headers: std::collections::HashMap<String, String> = response
        .headers()
        .iter()
        .map(|(k, v)| (k.to_string(), v.to_str().unwrap_or("").to_string()))
        .collect();
    
    let headers_size = headers.iter().map(|(k, v)| k.len() + v.len() + 4).sum();
    let body = response.text().await.map_err(|e| e.to_string())?;
    let body_size = body.len();
    
    let total_time = start.elapsed().as_millis() as u64;
    
    Ok(ResponseData {
        status: status.as_u16(),
        status_text: status.canonical_reason().unwrap_or("").to_string(),
        headers,
        body,
        timing: Timing {
            first_byte: first_byte_time,
            total: total_time,
        },
        size: Size {
            headers: headers_size,
            body: body_size,
        },
    })
}
