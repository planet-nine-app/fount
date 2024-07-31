import db from '../persistence/db.js';
import dayjs from 'dayjs';

const maxMPAndRegenerationRate = { // These magic numbers have an interesting future role. The idea
                                      // was that these would grow with the system so that as more people
                                      // use it, everyone will be able to do more stuff. Not sure how
                                      // that fits now, but I'm gonna keep them for now.
  "maxMP": 1000,  
  "mpRegenerationRate": 1.666667,
};

const mpToNineumRatio = 200; // Another magic number (really these are all config settings, but I didn't 
                                // feel like adding a config at this point since it might change

const calculateMP = (user) => {
  const maxMP = maxMPAndRegenerationRate.maxMP;
  const lastMPUsed = user.lastMPUsed;
  const regenerationRate = maxMPAndRegenerationRate.regenerationRate;

  const now = dayjs();
  const lastUsed = moment(lastMPUsed);
  const differenceInMinutes = now.diff(lastUsed, 'minutes');
  const mpToAdd = Math.floor(differenceInMinutes * regenerationRate);

  let mp = user.mp;
  if(mp + mpToAdd > maxMP) {
    user.mp = maxMP;
  } else {
    user.mp = mp + mpToAdd;
  }
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
    await db.putUser(foundUser);
    return foundUser;
  },

  putUser: async (newUser) => {
    newUser.mp = maxMPAndRegenerationRate.maxMP;
    newUser.lastMPUsed = new Date().getTime();
    newUser.nineumCount = 0;
    const uuid = await db.putUser(newUser);

    newUser.uuid = uuid;

    return newUser;
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
    
    const success = await db.saveNineum(user, newNineum);

    if(success) {
      caster.mp -= amount;
      await db.saveUser(caster);
    }

    return success;
  }
};

export default user;
