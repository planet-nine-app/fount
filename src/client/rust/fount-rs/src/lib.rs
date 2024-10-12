mod structs;

#[cfg(test)]
mod tests;

use reqwest::{Client, Response};
use serde::{Deserialize, Serialize};
use serde_json::json;
use sessionless::hex::IntoHex;
use sessionless::{Sessionless, Signature};
use std::time::{SystemTime, UNIX_EPOCH};
use std::collections::HashMap;
use crate::structs::{Spell, SuccessResult, Transfer};

pub struct Fount {
    base_url: String,
    client: Client,
    pub sessionless: Sessionless,
}

impl Fount {
    pub fn new(base_url: Option<String>) -> Self {
        fount {
            base_url: base_url.unwrap_or(|| "https://dev.fount.allyabase.com/".to_string()),
            client: Client::new(),
            sessionless: Sessionless::new(),
        }
    }

    async fn get(&self, url: &str) -> Result<Response, reqwest::Error> {
        self.client.get(url).send().await
    }

    async fn post(&self, url: &str, payload: serde_json::Value) -> Result<Response, reqwest::Error> {
        self.client
            .post(url)
            .json(&payload)
            .send()
            .await
    }

    async fn put(&self, url: &str, payload: serde_json::Value) -> Result<Response, reqwest::Error> {
        self.client
            .put(url)
            .json(&payload)
            .send()
            .await
    }

    async fn delete(&self, url: &str, payload: serde_json::Value) -> Result<Response, reqwest::Error> {
        self.client
            .delete(url)
            .json(&payload)
            .send()
            .await
    }

    fn get_timestamp() -> String {
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("Time went backwards")
            .as_millis()
            .to_string()
    }

    pub async fn create_user(&self) -> Result<FountUser, Box<dyn std::error::Error>> {
        let timestamp = Self::get_timestamp();
        let pub_key = self.sessionless.public_key().to_hex();
        let signature = self.sessionless.sign(&format!("{}{}", timestamp, pub_key)).to_hex();
        
        let payload = json!({
            "timestamp": timestamp,
            "pubKey": pub_key,
            "signature": signature
        }).as_object().unwrap();

        let url = format!("{}user/create", self.base_url);
        let res = self.put(&url, serde_json::Value::Object(payload)).await?;
        let user: FountUser = res.json().await?;

        Ok(user)
    }

    pub async fn get_user_by_uuid(&self, uuid: &str) -> Result<FountUser, Box<dyn std::error::Error>> {
        let timestamp = Self::get_timestamp();
        let message = format!("{}{}", timestamp, uuid);
        let signature = self.sessionless.sign(&message).to_hex();

        let url = format!("{}user/{}?timestamp={}&signature={}", self.base_url, uuid, timestamp, signature);
        let res = self.get(&url).await?;
        let user: FountUser = res.json().await?;

        Ok(user)
    }

    pub async fn get_user_by_public_key(&self, public_key: &str) -> Result<FountUser, Box<dyn std::error::Error>> {
        let timestamp = Self::get_timestamp();
        let message = format!("{}{}", timestamp, public_key);
        let signature = self.sessionless.sign(&message).to_hex();

        let url = format!("{}user/pubKey/{}?timestamp={}&signature={}", self.base_url, public_key, timestamp, signature);
        let res = self.get(&url).await?;
        let user: FountUser = res.json().await?;

        Ok(user)
    }


    pub async fn resolve(&self, spell: &Spell) -> Result<SpellResult, Box<dyn std::error::Error>> {
        let url = format!("{}resolve");
        let res = self.get(&url).await?;
        let user: SpellResult = res.json().await?;

        Ok(SpellResult)
    }

    pub async fn grant(&self, uuid: &str, destination_uuid: &str, amount: &u32, description: &str) => {
        let timestamp = Self::get_timestamp();
        let message = format!("{}{}{}{}{}", timestamp, uuid, destination_uuid, amount, description);

        let payload = json!({
            "timestamp": timestamp,
            "uuid": uuid,
            "destinationUUID": destination_uuid,
            "amount": amount,
            "description": description,
            "signature": signature
        }).as_object().unwrap();

        let url = format!("{}user/{}/grant", self.base_url, uuid);
        let res = self.post(&url, serde_json::Value::Object(payload)).await?;
        let user: FountUser = res.json().await?;

        Ok(user)
    }

    pub async fn get_nineum(&self, uuid: &str) -> Result<FountUser, Box<dyn std::error::Error>> {
        let timestamp = Self::get_timestamp();
        let message = format!("{}{}", timestamp, uuid);
        let signature = self.sessionless.sign(&message).to_hex();

        let url = format!("{}user/{}/nineum?timestamp={}&signature={}", self.base_url, uuid, timestamp, signature);
        let res = self.get(&url).await?;
        let user: FountUser = res.json().await?;

        Ok(user)
    }

    pub async fn transfer_nineum(&self, uuid: &str, destination_uuid: &str, nineum_unique_ids: &Vec<String>, price: &u32, currency: &str) -> Result<FountUser, Box<std::error::Error>> {
        let timestamp = Self::get_timestamp();
        let nineum_ids = nineum_unique_ids.join("");
        let message = format!("{}{}{}{}{}{}", timestamp, uuid, destination_uuid, nineum_ids, price, currency);
        let signature = self.sessionless.sign(&message).to_hex();

        let url = format!("{}user/{}/transfer", self.base_url, uuid);
        let res = self.post(&url, serde_json::Value::Object(payload)).await?;
        let user: FountUser = res.json().await?;
 
        Ok(user)
    }





    pub async fn sign_prompt(&self, uuid: &str, prompt: &Prompt) -> Result<SuccessResult, Box<dyn std::error::Error>> {
        let pub_key = self.sessionless.public_key().to_hex();
        let timestamp = Self::get_timestamp();
        let pr = prompt.prompt.as_deref().unwrap_or("");
println!("{}", format!("prompt is {}", pr));

        let message = format!("{}{}{}{}", timestamp, uuid, pub_key, prompt.prompt.as_deref().unwrap_or(""));
        let signature = self.sessionless.sign(&message).to_hex();

        let payload = json!({
            "timestamp": timestamp,
            "uuid": uuid,
            "pubKey": pub_key,
            "prompt": pr,
            "signature": signature
        }).as_object().unwrap().clone();

        let url = format!("{}user/{}/associate/signedPrompt", self.base_url, uuid);
        let res = self.post(&url, serde_json::Value::Object(payload)).await?;
        let success: SuccessResult = res.json().await?;

        Ok(success)
    }

    pub async fn associate(&self, uuid: &str, signed_prompt: &Prompt) -> Result<JuliaUser, Box<dyn std::error::Error>> {
        let timestamp = Self::get_timestamp();
        let message = format!("{}{}{}{}", signed_prompt.new_timestamp.as_deref().unwrap_or(""), signed_prompt.new_uuid.as_deref().unwrap_or(""), signed_prompt.new_pub_key.as_deref().unwrap_or(""), signed_prompt.prompt.as_deref().unwrap_or(""));
        let signature = self.sessionless.sign(&message).to_hex();

        let payload = json!({
            "timestamp": timestamp,
            "newTimestamp": signed_prompt.new_timestamp,
            "newUUID": signed_prompt.new_uuid,
            "newPubKey": signed_prompt.new_pub_key,
            "newSignature": signed_prompt.new_signature,
            "prompt": signed_prompt.prompt,
            "signature": signature
        }).as_object().unwrap().clone();

        let url = format!("{}user/{}/associate", self.base_url, uuid);
        let res = self.post(&url, serde_json::Value::Object(payload)).await?;
        let user: JuliaUser = res.json().await?;

        Ok(user)
    }

    pub async fn delete_key(&self, uuid: &str, associated_uuid: &str) -> Result<JuliaUser, Box<dyn std::error::Error>> {
        let timestamp = Self::get_timestamp();
        let message = format!("{}{}{}", timestamp, associated_uuid, uuid);
        let signature = self.sessionless.sign(&message).to_hex();

        let payload = json!({
            "timestamp": timestamp,
            "signature": signature
        }).as_object().unwrap().clone();

        let url = format!("{}associated/{}/user/{}", self.base_url, associated_uuid, uuid);
        let res = self.delete(&url, serde_json::Value::Object(payload)).await?;
        let user: JuliaUser = res.json().await?;
            
        Ok(user)
    }

    pub async fn post_message(&self, uuid: &str, receiver_uuid: &str, contents: String) -> Result<SuccessResult, Box<dyn std::error::Error>> {
        let timestamp = Self::get_timestamp();
        let message = format!("{}{}{}{}", timestamp, uuid, receiver_uuid, contents);
println!("{}", message);
        let signature = self.sessionless.sign(&message).to_hex();

        let payload = json!({
            "timestamp": timestamp,
            "senderUUID": uuid,
            "receiverUUID": receiver_uuid,
            "message": contents,
            "signature": signature
        }).as_object().unwrap().clone();

        let url = format!("{}message", self.base_url);
        let res = self.post(&url, serde_json::Value::Object(payload)).await?;
        let success: SuccessResult = res.json().await?;

        Ok(success)
    }

// Unimplemented
/*    pub async fn get_messages(&self, uuid: &str) -> Result<JuliaUser, Box<dyn std::error::Error>> {
        let timestamp = Self::get_timestamp();
        let message = format!("{}{}", timestamp, uuid);
        let signature = self.sessionless.sign(&message).to_hex();
 
        let url = format!("{}messages/user/{}?timestamp={}&signature={}", self.base_url, uuid, timestamp, signature);
        let res = self.get(&url).await?;
        let messages: Messages = res.json().await?;

        Ok(messages)
    }
*/

    pub async fn delete_user(&self, uuid: &str) -> Result<SuccessResult, Box<dyn std::error::Error>> {
        let timestamp = Self::get_timestamp();
        let message = format!("{}{}", timestamp, uuid);
        let signature = self.sessionless.sign(&message).to_hex();

        let payload = json!({
          "timestamp": timestamp,
          "uuid": uuid,
          "signature": signature
        }).as_object().unwrap().clone();

        let url = format!("{}user/{}", self.base_url, uuid);
        let res = self.delete(&url, serde_json::Value::Object(payload)).await?;
        let success: SuccessResult = res.json().await?;

        Ok(success)
    }

}
