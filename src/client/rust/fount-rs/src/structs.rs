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
    pub last_experience_calculated: u64,
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
    pub timestamp: String,
    pub spell: String,
    #[serde(rename = "casterUUID")]
    pub caster_uuid: String,
    pub total_cost: u32, 
    pub mp: bool,
    pub ordinal: u32,
    pub caster_signature: String,
    #[serde(flatten)]
    pub extra: HashMap<String, Value>,
    pub gateways: Vec<Gateway>
}

impl Default for Spell {
    fn default() -> Self {
	Spell {
	    timestamp: "now".to_string(),
	    spell: "test".to_string(),
	    caster_uuid: "".to_string(),
	    total_cost: 200,
	    mp: true,
	    ordinal: 1,
	    caster_signature: "".to_string(),
	    extra: HashMap::<String, Value>::new(),
	    gateways: Vec::<Gateway>::new()
        }
    }
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

