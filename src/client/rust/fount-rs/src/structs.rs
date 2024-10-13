use serde::{Deserialize, Serialize};
use serde_json::json;
use std::collections::HashMap;
use serde_json::Value;

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
    pub last_experience_calculated: String,
    pub experience_pool: u32,
    pub nineum_count: u64,
    pub ordinal: u32,
    pub uuid: String
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all="camelCase")]
pub struct Gateway {
    timestamp: String,
    uuid: String,
    minimum_cost: u32,
    ordinal: u64,
    signature: String,
    #[serde(flatten)]
    extra: HashMap<String, Value>
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all="camelCase")]
pub struct Spell {
    timestamp: String,
    spell: String,
    #[serde(rename = "casterUUID")]
    caster_uuid: String,
    total_cost: u32, 
    mp: bool,
    ordinal: u32,
    caster_signature: String,
    #[serde(flatten)]
    extra: HashMap<String, Value>,
    gateways: Vec<Gateway>
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all="camelCase")]
pub struct SpellResult {
    pub success: bool,
    // arbitrary json somehow?
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct SuccessResult {
    pub success: bool
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all="camelCase")]
pub struct Nineum {
    pub nineum: Vec<String>
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all="camelCase")]
pub struct Transfer {
    pub timestamp: String,
    #[serde(rename = "senderUUID")]
    pub sender_uuid: String,
    #[serde(rename = "receiverUUID")]
    pub receiver_uuid: String,
    pub message: String,
}

