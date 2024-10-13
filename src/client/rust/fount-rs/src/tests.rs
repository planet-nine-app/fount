use crate::{FountUser, Fount, Prompt};
use sessionless::hex::IntoHex;

#[actix_rt::test]
async fn test_fount() {

    let mut saved_user: Option<FountUser> = Some(FountUser::new("foo".to_string(), "bar".to_string()));
    let mut saved_user2: Option<FountUser> = Some(FountUser::new("foo".to_string(), "bar".to_string()));
    let fount = Fount::new(Some("http://localhost:3006/".to_string()));
    let fount2 = Fount::new(Some("http://localhost:3006/".to_string()));

    async fn create_user(fount: &Fount, saved_user: &FountUser) -> Option<FountUser> {
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
	let result = fount.create_user(fount_user).await;
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
	let result = fount.get_user_by_uuid().await; 
     
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
        let spell = "test";
        let caster_uuid = saved_user.uuid;
        let total_cost = 400;
        let mp = 400;
        let ordinal = 1;
        let gateways = Vec<Gateway>();

        let message = format!("{}{}{}{}{}{}", timestamp, spell, caster_uuid, total_cost, mp, ordinal);
        let signature = self.sessionless.sign(&message).to_hex(); 

        let payload = json!({
            "timestamp": timestamp,
            "spell": spell,
            "casterUUID": caster_uuid,
            "totalCost": total_cost,
            "mp": mp,
            "ordinal": ordinal,
            "gateways": gateways,
            "signature": signature
        });     
  
	let result = fount.resolve(&payload).await;         
     
	match result {
	    Ok(spell_result) => {
		assert_eq!(
		    user.pending_prompts.len(),
		    1
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

    async fn grant(fount: &Fount, save_user: &FountUser, saved_user2: &FountUser) -> Option<FountUser> {
        let result = fount.grant(&saved_user.uuid, &saved_user2.uuid, 200, "Testing out grants").await;

        match result {
            Ok(user) {

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
            Ok(nineum) {

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
            Ok(nineum) {
                let transfer_result = fount.transfer_nineum(&saved_user.uuid, &saved_user2.uuid, nineum, 0, "usd").await;
               
                match transfer_result {
                    Ok(user) {
                        assert...

                        Ok(user)
                    }
                }
                Err(error) => {
		    eprintln!("Error occurred transfer: {}", error);
		    println!("Error details: {:?}", error);
		    None
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

            }
            Err(error) => {
                eprintln!("Error occurred delete: {}", error);
                println!("Error details: {:?}", error);
                None
            }
        }
    }

    async fn sign_prompt(fount: &Fount, fount2: &Fount, saved_user: &FountUser, saved_user2: &FountUser) -> Option<FountUser> {
        let pending_prompts: Vec<Prompt> = saved_user.pending_prompts.values().cloned().collect();
	let result = fount2.sign_prompt(&saved_user2.uuid, &pending_prompts[0]).await; 
        let updated_user = fount.get_user(&saved_user.uuid).await;
     
	match updated_user {
	    Ok(user) => {
                let updated_prompts: Vec<Prompt> = user.pending_prompts.values().cloned().collect();
                let formatted = format!("{:?}", updated_prompts[0].new_uuid);
		assert_eq!(
		    formatted.len(),
		    44
		);
                Some(user)
	    }
	    Err(error) => {
		eprintln!("Error occurred sign_prompt: {}", error);
		println!("Error details: {:?}", error);
                None
	    }
	} 
    }

    async fn associate(fount: &Fount, saved_user: &FountUser) -> Option<FountUser> {
        let pending_prompts: Vec<Prompt> = saved_user.pending_prompts.values().cloned().collect();
	let result = fount.associate(&saved_user.uuid, &pending_prompts[0]).await;
     
	match result {
	    Ok(user) => {
		assert_eq!(
		    user.keys["interactingKeys"].len(),
		    2
		);   
                Some(user)
	    }
	    Err(error) => {
		eprintln!("Error occurred associate: {}", error);
		println!("Error details: {:?}", error);
                None
	    }
	}
    }

    async fn post_message(fount: &Fount, saved_user: &FountUser, saved_user2: &FountUser) {
	let result = fount.post_message(&saved_user.uuid, &saved_user2.uuid, "Here is a test message".to_string()).await;
     
	match result {
	    Ok(success) => {
		assert_eq!(
		    success.success,
		    true
		);
	    }
	    Err(error) => {
		eprintln!("Error occurred post_message: {}", error);
		println!("Error details: {:?}", error);
	    }
	}
    }

    async fn delete_key(fount: &Fount, saved_user: &FountUser, saved_user2: &FountUser) -> Option<FountUser> {
	let result = fount.delete_key(&saved_user.uuid, &saved_user2.uuid).await;
     
	match result {
	    Ok(user) => {
		assert_eq!(
		    user.keys["interactingKeys"].len(),
		    1
		);
                Some(user)
	    }
	    Err(error) => {
		eprintln!("Error occurred delete_key: {}", error);
		println!("Error details: {:?}", error);
                None
	    }
	}
    }


    async fn delete_user(fount: &Fount, saved_user: &FountUser) {
	let result = fount.delete_user(&saved_user.uuid).await;

	match result {
	    Ok(success) => {
	       assert_eq!(
		    success.success,
		    true
		); 
	    }
	    Err(error) => {
		eprintln!("Error occurred delete_user: {}", error);
		println!("Error details: {:?}", error);
	    }
	}
    }

    if let Some(ref user) = saved_user {
        saved_user = Some(create_user(&fount, user).await.expect("user"));
    } else {    
        panic!("Failed to create user to begin with"); 
    }           
            
    if let Some(ref user) = saved_user2 {
        saved_user2 = Some(create_user2(&fount2, user).await.expect("user2"));
    } else {
        panic!("Failed to create user2");
    }

    if let Some(ref user) = saved_user2 {
        saved_user2 = Some(get_user(&fount2, user).await.expect("get user2 1"));
    } else {
        panic!("Failed to get user");
    }

    if let Some(ref user) = saved_user {
	saved_user = Some(get_prompt(&fount, user).await.expect("get prompt"));
    } else {
	panic!("Failed to get prompt");
    }

    if let (Some(ref user), Some(ref user2)) = (saved_user, saved_user2) {
        Some(sign_prompt(&fount, &fount2, user, user2).await);
        saved_user = Some(get_user(&fount, user).await.expect("get user after signing prompt"));
        saved_user2 = Some(get_user(&fount2, user2).await.expect("get user2"));
    } else { 
        panic!("Failed to sign prompt");
    } 

    if let (Some(ref user), Some(ref user2)) = (saved_user, saved_user2) {
        saved_user = Some(associate(&fount, user).await.expect("associate"));

        if let Some(ref user) = saved_user {
            post_message(&fount, user, user2).await;
        } else {
	    panic!("Failed to post message");
	} 
        
        if let Some(ref user) = saved_user {
            saved_user = Some(delete_key(&fount, user, user2).await.expect("delete_key"));
        } else {
	    panic!("Failed to delete key");
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
