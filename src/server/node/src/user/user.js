import db from '../persistence/db.js';
import nineum from '../nineum/nineum.js';
import dayjs from 'dayjs';
import stripe from 'stripe';
import { stripeKey } from '../../config/default.js';
 
const stripeSDK = stripe(stripeKey);

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
    let foundUser = await db.getUser(uuid);
    foundUser = calculateMP(foundUser);
    foundUser = calculateExperience(foundUser);
    await db.saveUser(foundUser);
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
    newUser.mp = maxMPAndRegenerationRate.maxMP;
    newUser.maxMP = maxMPAndRegenerationRate.maxMP;
    newUser.lastMPUsed = new Date().getTime();

    newUser.experience = 0;
    newUser.lastExperienceCalculated = new Date().getTime() + '';
    newUser.experiencePool = 0;

    newUser.nineumCount = 0;
    const uuid = await db.putUser(newUser, pubKey);

    newUser.uuid = uuid;

    return newUser;
  },

  saveUser: async (userToSave) => {
    await db.saveUser(userToSave);
    return true;
  },

  getNineum: async (foundUser) => {
    return await db.getNineum(foundUser);
  },

  deleteUser: async (userToDelete) => {
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
      await db.saveUser(caster);
    }

    return success;
  },

  spendMoney: async (caster, payload, totalCost) => {

    const totalMinimum = payload.gateways.reduce((acc, cur) => acc + cur.minimumCost, 0);
    const totalDiff = totalCost - totalMinimum;
    if(totalDiff < 0) {
      return false;
    }
    const additional = Math.floor(totalDiff / (payload.gateways.length + 1));

    const charge = await stripeSDK.charges.create({
      amount: totalCost, // Amount in cents
      currency: 'usd',
      source: 'tok_bypassPending', // payment source for user
      transfer_group: 'GROUP_1',
      description: 'Charge for order 123'
    });   

    const transferPromises = gatewayUsers.map((gatewayUser, index) => {
      return stripeSDK.transfers.create({
        amount: payload.gateways[index].minimumCost + additional,
        currency: 'usd',
        destination: gatewayUser.stripeAccountId, // ID of the first connected account
        transfer_group: 'GROUP_1'
      });
    });

    transferPromises.push(stripeSDK.transfers.create({
      amount: additional,
      currency: 'usd',
      destination: '<planet nine account>',
      transfer_group: 'GROUP_1'
    }));

    const transfers = await Promise.all(transferPromises);
  }
};

export default user;
