pub mod structs;

#[cfg(test)]
mod tests;

use reqwest::{Client, Response};
use serde::{Deserialize, Serialize};
use serde_json::json;
use sessionless::hex::IntoHex;
use sessionless::{Sessionless, Signature};
use std::time::{SystemTime, UNIX_EPOCH};
use std::collections::HashMap;
use std::option::Option;
use crate::structs::{Gateway, Nineum, Spell, SpellResult, SuccessResult, Transfer};

pub struct Fount {
    base_url: String,
    client: Client,
    pub sessionless: Sessionless,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all="camelCase")]
pub struct FountUser {
    pub pub_key: String,
    pub mp: u32,
    #[serde(rename = "maxMP")]
    pub max_mp: u32,
    #[serde(rename = "lastMPUsed")]
    pub last_mp_used: u64,
    pub experience: u64,
    #[serde(rename = "lastExperienceCalculated")]
    pub last_experience_calculated: u64,
    pub experience_pool: u32,
    pub nineum_count: u64,
    pub ordinal: u32,
    pub uuid: String
}

impl Fount {
    pub fn new(base_url: Option<String>, sessionless: Option<Sessionless>) -> Self {
        Fount {
            base_url: base_url.unwrap_or("https://dev.fount.allyabase.com/".to_string()),
            client: Client::new(),
            sessionless: sessionless.unwrap_or(Sessionless::new()),
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
        }).as_object().unwrap().clone();

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

    pub async fn get_user_by_public_key(&self) -> Result<FountUser, Box<dyn std::error::Error>> {
        let timestamp = Self::get_timestamp();
        let public_key = self.sessionless.public_key().to_hex();
        let message = format!("{}{}", timestamp, public_key);
        let signature = self.sessionless.sign(&message).to_hex();

        let url = format!("{}user/pubKey/{}?timestamp={}&signature={}", self.base_url, public_key, timestamp, signature);
        let res = self.get(&url).await?;
        let user: FountUser = res.json().await?;

        Ok(user)
    }


    pub async fn resolve(&self, spell: &Spell) -> Result<SpellResult, Box<dyn std::error::Error>> {
        let spell_name = spell.spell.clone();
        let url = format!("{}resolve/{}", self.base_url, spell_name);
        let res = self.post(&url, serde_json::to_value(&spell)?).await?;
        let spell_result: SpellResult = res.json().await?;

        Ok(spell_result)
    }

    pub async fn grant(&self, uuid: &str, destination_uuid: &str, amount: &u32, description: &str) -> Result<FountUser, Box<dyn std::error::Error>> {
        let timestamp = Self::get_timestamp();
        let message = format!("{}{}{}{}{}", timestamp, uuid, destination_uuid, amount, description);
        let signature = self.sessionless.sign(&message).to_hex();

        let payload = json!({
            "timestamp": timestamp,
            "uuid": uuid,
            "destinationUUID": destination_uuid,
            "amount": amount,
            "description": description,
            "signature": signature
        }).as_object().unwrap().clone();

        let url = format!("{}user/{}/grant", self.base_url, uuid);
        let res = self.post(&url, serde_json::Value::Object(payload)).await?;
        let user: FountUser = res.json().await?;

        Ok(user)
    }

    pub async fn get_nineum(&self, uuid: &str) -> Result<Nineum, Box<dyn std::error::Error>> {
        let timestamp = Self::get_timestamp();
        let message = format!("{}{}", timestamp, uuid);
        let signature = self.sessionless.sign(&message).to_hex();

        let url = format!("{}user/{}/nineum?timestamp={}&signature={}", self.base_url, uuid, timestamp, signature);
        let res = self.get(&url).await?;
        let nineum: Nineum = res.json().await?;

        Ok(nineum)
    }

    pub async fn transfer_nineum(&self, uuid: &str, destination_uuid: &str, nineum_unique_ids: &Vec<String>, price: &u32, currency: &str) -> Result<FountUser, Box<dyn std::error::Error>> {
        let timestamp = Self::get_timestamp();
        let nineum_ids = nineum_unique_ids.join("");
        let message = format!("{}{}{}{}{}{}", timestamp, uuid, destination_uuid, nineum_ids, price, currency);
println!("{}", message);
        let signature = self.sessionless.sign(&message).to_hex();

        let payload = json!({
            "timestamp": timestamp,
            "destinationUUID": destination_uuid,
            "nineumUniqueIds": nineum_unique_ids,
            "price": price,
            "currency": currency, 
            "signature": signature
        }).as_object().unwrap().clone();

        let url = format!("{}user/{}/transfer", self.base_url, uuid);
        let res = self.post(&url, serde_json::Value::Object(payload)).await?;
        let user: FountUser = res.json().await?;
 
        Ok(user)
    }

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
