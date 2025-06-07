import db from '../persistence/db.js';
import nineum from '../nineum/nineum.js';
import sessionless from 'sessionless-node';
import dayjs from 'dayjs';

await sessionless.generateKeys(() => {}, db.getKeys);

const post = async (url, payload) => {
  return await fetch(url, {
    method: 'post',
    body: JSON.stringify(payload),
    headers: {'Content-Type': 'application/json'}
  });
};
 
const maxMPAndRegenerationRate = { // These magic numbers have an interesting future role. The idea
                                      // was that these would grow with the system so that as more people
                                      // use it, everyone will be able to do more stuff. Not sure how
                                      // that fits now, but I'm gonna keep them for now.
  "maxMP": 1000,  
  "regenerationRate": 1.666667,
};

const mpToNineumRatio = 200; // Another magic number (really these are all config settings, but I didn't 
                                // feel like adding a config at this point since it might change

const calculateMP = (user) => {
console.log('start', user.mp);
  const maxMP = maxMPAndRegenerationRate.maxMP;
  const lastMPUsed = user.lastMPUsed;
  const regenerationRate = maxMPAndRegenerationRate.regenerationRate;

  const now = dayjs();
  const lastUsed = dayjs(lastMPUsed);
  const differenceInMinutes = now.diff(lastUsed, 'minutes');
console.log('diff', differenceInMinutes, 'reg', regenerationRate);
  const mpToAdd = Math.floor(differenceInMinutes * regenerationRate);
console.log('mpToAdd', mpToAdd);

  let mp = user.mp;
console.log('mp', mp, 'mpToAdd', mpToAdd, 'maxMP', maxMP);
  if(mp + mpToAdd > maxMP) {
    user.mp = maxMP;
  } else {
    user.mp = mp + mpToAdd;
  }
  user.maxMP = maxMP;
  return user;
};

const calculateExperience = (user) => {
  let experience = user.experience;
  let experiencePool = user.experiencePool;
  let lastExperienceCalculated = user.lastExperienceCalculated;

  const lastUsed = dayjs(lastExperienceCalculated);
  const now = dayjs();
  const absorptionRate = 10; // This is a magic number for now. When I originally made this you had
                             // a character with stats, and the stats would dictate the absorption rate
                             // to keep this simple for now i'm just going to hardcode this.
  const differenceInMinutes = now.diff(lastUsed, 'minutes');
  const experienceToAbsorb = Math.min(Math.ceil(differenceInMinutes * absorptionRate), experiencePool);

  experiencePool -= experienceToAbsorb;
  experience += experienceToAbsorb;
  user.lastExperienceCalculated = new Date().getTime();
  user.experiencePool = experiencePool;
  user.experience = experience;
  
  return user;
};

const user = {
  getUser: async (uuid) => {
console.log('getting user', uuid);
    let foundUser = await db.getUser(uuid);
    foundUser = calculateMP(foundUser);
    foundUser = calculateExperience(foundUser);
    await db.saveUser(foundUser);
console.log('foundUser', foundUser);
    return foundUser;
  },

  getUserByPublicKey: async (pubKey) => {
    let foundUser = await db.getUserByPublicKey(pubKey);
    foundUser = calculateMP(foundUser);
    foundUser = calculateExperience(foundUser);
    await db.saveUser(foundUser);
    return foundUser;
  },

  putUser: async (newUser, pubKey) => {
console.log('called put user');
    newUser.mp = maxMPAndRegenerationRate.maxMP;
    newUser.maxMP = maxMPAndRegenerationRate.maxMP;
    newUser.lastMPUsed = new Date().getTime();
console.log('in putUser after mp');

    newUser.experience = 0;
    newUser.lastExperienceCalculated = new Date().getTime();
    newUser.experiencePool = 0;

    newUser.nineumCount = 0;
    newUser.ordinal = 0;
try {
    const uuid = await db.putUser(newUser, pubKey);

    newUser.uuid = uuid;
console.log('In fount, the new user looks like: ', newUser);

    return newUser;
} catch(err) {
console.error(err);
console.log('it\'s failing here');
}


  },

  saveUser: async (userToSave) => {
    userToSave.ordinal += 1;
    await db.saveUser(userToSave);
    return true;
  },

  getNineum: async (foundUser) => {
    return await db.getNineum(foundUser);
  },

  deleteUser: async (userToDelete) => {
console.log('user/user', userToDelete);
    return (await db.deleteUser(userToDelete));
  },

  spendMP: async (caster, amount) => {
    const nineumToConstruct = amount / mpToNineumRatio;
    const partialNineum = nineumToConstruct % 1;
    const wholeNineum = Math.floor(nineumToConstruct) + (Math.random() < partialNineum ? 1 : 0);

    const newNineum = [];
    for(var i = 0; i < wholeNineum; i++) {
      const constructedNineum = await nineum.constructNineum();
      newNineum.push(constructedNineum);
    }
    
    const success = await db.saveNineum(caster, newNineum);

    if(success) {
console.log(caster.mp);
console.log(amount);
      caster.mp -= amount;
console.log(caster.mp);
      caster.nineumCount += newNineum.length;
      await db.saveUser(caster);
    }

    return success;
  },

 /**
  * This function is being split between fount and addie, and will be commented out here until that's done.
  */

  spendMoney: async (caster, spell, gatewayUsers, totalCost) => {
    const payload = {
      timestamp: new Date().getTime() + '',
      caster,
      spell,
      gatewayUsers
    };
    
    let foundUser = await db.getUser('fount');

    const message = payload.timestamp + foundUser.addieUUID;
    payload.signature = await sessionless.sign(message);

    const path = `money/processor/stripe/user/${foundUser.addieUUID}`;

    const addieURL = process.env.LOCALHOST ? `http://localhost:3005/${path}` : `${SUBDOMAIN}.addie.allyabase.com/${path}`;    

    const res = await post(addieURL, payload);
    const json = await res.json();
    return json.success;
  }
};

export default user;
