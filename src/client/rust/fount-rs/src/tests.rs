use crate::{FountUser, Fount, Gateway, Nineum, Spell, SpellResult, SuccessResult};
use sessionless::hex::IntoHex;
use sessionless::hex::FromHex;
use sessionless::{Sessionless, PrivateKey};
use std::collections::HashMap;
use serde_json::json;
use serde_json::Value;

#[actix_rt::test]
async fn test_fount() {

    let mut saved_user: Option<FountUser>;
    let mut saved_user2: Option<FountUser>; 
    let fount = Fount::new(Some("http://localhost:3006/".to_string()), None);
    let fount2 = Fount::new(Some("http://localhost:3006/".to_string()), None);
    let fount3 = Fount::new(Some("http://localhost:3006/".to_string()), Some(Sessionless::from_private_key(PrivateKey::from_hex("a29435a4fb1a27a284a60b3409efeebbe6a64db606ff38aeead579ccf2262dc4").expect("private key"))));

    async fn create_user(fount: &Fount) -> Option<FountUser> {
    println!("creating user");
	let result = fount.create_user().await;
    println!("got to here");

	match result {
	    Ok(user) => {
		println!("Successfully got FountUser: {}", user.uuid);
		assert_eq!(
		    user.uuid.len(),
		    36
		);
                Some(user)
	    },
	    Err(error) => {
		eprintln!("Error occurred create_user: {}", error);
		println!("Error details: {:?}", error);
                None
	    }
	}
    }

    async fn create_user2(fount: &Fount, saved_user2: &FountUser) -> Option<FountUser> {
    println!("creating user2");
	let result = fount.create_user().await;
    println!("got to here");

	match result {
	    Ok(user) => {
		println!("Successfully got FountUser: {}", user.uuid);
		assert_eq!(
		    user.uuid.len(),
		    36
		);
                Some(user)
	    },
	    Err(error) => {
		eprintln!("Error occurred create_user2: {}", error);
		println!("Error details: {:?}", error);
                None
	    }
	}
    }

    async fn get_user_by_uuid(fount: &Fount, saved_user: &FountUser) -> Option<FountUser> {
	let result = fount.get_user_by_uuid(&saved_user.uuid).await; 
     
	match result {
	    Ok(user) => {
		assert_eq!(
		    user.uuid.len(),
		    36
		);
                Some(user)
	    }
	    Err(error) => {
		eprintln!("Error occurred get_user: {}", error);
		println!("Error details: {:?}", error);
                None
	    }
	} 
    }

    async fn get_user_by_public_key(fount: &Fount) -> Option<FountUser> {
	let result = fount.get_user_by_public_key().await; 
     
	match result {
	    Ok(user) => {
		assert_eq!(
		    user.uuid.len(),
		    36
		);
                Some(user)
	    }
	    Err(error) => {
		eprintln!("Error occurred get_user: {}", error);
		println!("Error details: {:?}", error);
                None
	    }
	} 
    }

    async fn resolve(fount: &Fount, saved_user: &FountUser) -> Option<SpellResult> {
        let timestamp = Fount::get_timestamp();
        let spell = "test".to_string();
        let caster_uuid = format!("{}", saved_user.uuid);
        let total_cost = 400;
        let mp = true;
        let ordinal = 1;
        let gateways = Vec::<Gateway>::new();

        let message = format!("{}{}{}{}{}{}", timestamp, spell, caster_uuid, total_cost, mp, ordinal);
        let signature = fount.sessionless.sign(&message).to_hex(); 

        let spell = Spell {
            timestamp: timestamp,
            spell: spell,
            caster_uuid: caster_uuid,
            total_cost: total_cost,
            mp: mp,
            ordinal: ordinal,
            gateways: gateways,
            caster_signature: signature,
            extra: HashMap::<String, Value>::new()
        };     
  
	let result = fount.resolve(&spell).await;         
     
	match result {
	    Ok(spell_result) => {
		assert_eq!(
		    spell_result.success,
		    true
		);
                Some(spell_result)
	    }
	    Err(error) => {
		eprintln!("Error occurred resolve: {}", error);
		println!("Error details: {:?}", error);
                None
	    }
	} 
    }

    async fn grant(fount: &Fount, saved_user: &FountUser, saved_user2: &FountUser) -> Option<FountUser> {
        let result = fount.grant(&saved_user.uuid, &saved_user2.uuid, &200, "Testing out grants").await;

        match result {
            Ok(user) => {
                assert_eq!(
                    user.mp,
                    586
                );
                Some(user)
            }
            Err(error) => {
                eprintln!("Error occurred grant: {}", error);
                println!("Error details: {:?}", error);
                None
            }
        }
    }

    async fn get_nineum(fount2: &Fount, saved_user2: &FountUser) -> Option<Nineum> {
        let result = fount2.get_nineum(&saved_user2.uuid).await;

        match result {
            Ok(nineum) => {
                assert_eq!(
                    nineum.nineum.len(),
                    2
                );
                Some(nineum)
            }
            Err(error) => {
                eprintln!("Error occurred grant: {}", error);
                println!("Error details: {:?}", error);
                None
            }
        }
    }

    async fn transfer_nineum(fount: &Fount, saved_user: &FountUser, saved_user2: &FountUser) -> Option<FountUser> {
        let result = fount.get_nineum(&saved_user.uuid).await;

        match result {
            Ok(nineum) => {
                let transfer_result = fount.transfer_nineum(&saved_user.uuid, &saved_user2.uuid, &nineum.nineum, &0, "usd").await;
               
                match transfer_result {
                    Ok(user) => {
                        assert_eq!(
                            user.nineum_count,
                            0
                        );
                        return Some(user)
                    }
		    Err(error) => {
			eprintln!("Error occurred transfer: {}", error);
			println!("Error details: {:?}", error);
			None
		    }

                }
            }
            Err(error) => {
                eprintln!("Error occurred transfer2: {}", error);
                println!("Error details: {:?}", error);
                None
            }
        }
    }

    async fn delete_user(fount: &Fount, saved_user: &FountUser) -> Option<SuccessResult> {
        let result = fount.delete_user(&saved_user.uuid).await;

        match result {
            Ok(success) => {
                assert_eq!(
                    success.success,
                    true
                );
                Some(success)
            }
            Err(error) => {
                eprintln!("Error occurred delete: {}", error);
                println!("Error details: {:?}", error);
                None
            }
        }
    }

    saved_user = Some(create_user(&fount).await.expect("user"));
    saved_user2 = Some(create_user(&fount2).await.expect("user2"));

/*    if let Some(ref user) = saved_user {
        saved_user = Some(create_user(&fount, user).await.expect("user"));
    } else {    
        panic!("Failed to create user to begin with"); 
    }           
            
    if let Some(ref user) = saved_user2 {
        saved_user2 = Some(create_user2(&fount2, user).await.expect("user2"));
    } else {
        panic!("Failed to create user2");
    }
*/

    if let Some(ref user) = saved_user2 {
        saved_user2 = Some(get_user_by_uuid(&fount2, user).await.expect("get user2 1"));
    } else {
        panic!("Failed to get user");
    }

    if let Some(ref user) = saved_user2 {
        saved_user2 = Some(get_user_by_public_key(&fount2).await.expect("get user2 by pubKey"));
    } else {
        panic!("Failed to get user");
    }

    if let Some(ref user) = saved_user {
	Some(resolve(&fount, user).await.expect("resolve"));
        saved_user = Some(get_user_by_uuid(&fount, user).await.expect("get user after resolving spell"));
    } else {
	panic!("Failed to get prompt");
    }

    if let (Some(ref user), Some(ref user2)) = (saved_user, saved_user2) {
        Some(grant(&fount, user, user2).await);
        saved_user = Some(get_user_by_uuid(&fount, user).await.expect("get user after grant"));
        saved_user2 = Some(get_user_by_uuid(&fount2, user2).await.expect("get user2"));
    } else { 
        panic!("Failed to sign prompt");
    } 

    if let Some(ref user) = saved_user {
        Some(get_nineum(&fount, user).await);
        saved_user = Some(get_user_by_uuid(&fount, user).await.expect("associate"));

        if let (Some(ref user), Some(ref user2)) = (saved_user, saved_user2) {
            saved_user = Some(transfer_nineum(&fount, user, user2).await.expect("transferring"));
            saved_user2 = Some(get_user_by_uuid(&fount2, &user2).await.expect("getting user 2"));
        } else {
	    panic!("Failed to post message");
	} 
        
        if let Some(ref user) = saved_user {
            delete_user(&fount, &user).await;
        } else {
	    panic!("Failed to delete user");
	} 

    } else {
        panic!("Failed on associate");
    }

}
