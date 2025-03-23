import { createClient } from './client.js';
import sessionless from 'sessionless-node';

const client = await createClient()
  .on('error', err => console.log('Redis Client Error', err))
  .connect();

const db = {
  getUser: async (uuid) => {
console.log('should get user by uuid');
    const user = await client.get(`user:${uuid}`);
    const parsedUser = JSON.parse(user);
    return parsedUser;
  },

  getUserByPublicKey: async (pubKey) => {
console.log('should get user by public key');
    const uuid = await client.get(`pubKey:${pubKey}`);
console.log('uuid', uuid);
    return await db.getUser(uuid);
  },

  putUser: async (user, pubKey) => {
    const uuid = sessionless.generateUUID();
    user.uuid = uuid;
    user.pubKey = pubKey;
    user.ordinal = 1;
    user.mp = 1000;
    await client.set(`pubKey:${pubKey}`, uuid);
    await client.set(`user:${uuid}`, JSON.stringify(user));
    return uuid;
  },

  saveUser: async (user) => {
    await client.set(`user:${user.uuid}`, JSON.stringify(user));
    return true;
  },

  deleteUser: async (uuid) => {
console.log('should delete: ', `user:${uuid}`);
    await client.del(`user:${uuid}`);

    return true;
  },

  getNineum: async (user) => {
console.log('getting nineum for: ', user.uuid);
    const nineumString = (await client.get(`user:nineum:${user.uuid}`)) || '{"nineum":[]}';
console.log('nineumString', nineumString);
console.log(JSON.parse(nineumString));
    return JSON.parse(nineumString);
  },

  saveNineum: async (user, _newNineum) => {
    const newNineum = _newNineum.map($ => $.toLowerCase());
console.log('new nineum', newNineum);
    const currentNineum = (await db.getNineum(user)).nineum;
console.log('current nineum', currentNineum);
    const allNineum = [...currentNineum, ...newNineum];
    await client.set(`user:nineum:${user.uuid}`, JSON.stringify({nineum: allNineum}));

    const galaxyMapJSON = (await client.get('galaxyMap')) || '{}';
    const galaxyMap = JSON.parse(galaxyMapJSON);

    const flavorMapJSON = (await client.get('flavorMap')) || '{}';
    const flavorMap = JSON.parse(flavorMapJSON);
    newNineum.forEach(nineum => {
      const galaxy = nineum.slice(2, 10);
      if(!galaxyMap[galaxy]) {
        galaxyMap[galaxy] = 1;
      }
      const flavor = nineum.slice(10, 24);
      if(!flavorMap[flavor]) {
        flavorMap[flavor] = 1;
      } else {
        flavorMap[flavor]++;
      }
    });
    
    user.nineumCount = allNineum.count;
    await db.saveUser(user);    

    await client.set('galaxyMap', JSON.stringify(galaxyMap));
    await client.set('flavorMap', JSON.stringify(flavorMap));

    return true;
  },

  isGalaxyOpen: async (galaxy) => {
    if(galaxy === '28880014') {
      return true;
    }
    const galaxyMapJSON = (await client.get('galaxyMap')) || '{}';
    const galaxyMap = JSON.parse(galaxyMapJSON);
console.log(galaxyMap);
console.log(galaxyMap[galaxy]);
    return !!!galaxyMap[galaxy];
  },
 
  countForFlavorOfNineum: async (flavor) => {
    const flavorMapJSON = (await client.get('flavorMap')) || '{}';
    const flavorMap = JSON.parse(flavorMapJSON);
    return flavorMap[flavor] || 0;
  },

  transferNineum: async (sourceUser, destinationUser, nineumToTransfer) => {
    if(sourceUser.uuid === destinationUser.uuid) {
      return sourceUser;
    }
    const sourceNineum = (await db.getNineum(sourceUser)).nineum;
    const destinationNineum = (await db.getNineum(destinationUser)).nineum;
  
    let transferredNineumCount = 0;

    nineumToTransfer.forEach(nineum => {
      const index = sourceNineum.indexOf(nineum);
      if(index === -1) {
        return;
      }
      destinationNineum.push(sourceNineum.splice(index, 1).pop());
      transferredNineumCount++;
    });  

    await client.set(`user:nineum:${sourceUser.uuid}`, JSON.stringify({nineum: sourceNineum}));
    await client.set(`user:nineum:${destinationUser.uuid}`, JSON.stringify({nineum: destinationNineum}));

    sourceUser.nineumCount -= transferredNineumCount;
    destinationUser.nineumCount += transferredNineumCount;

    await db.saveUser(sourceUser);
    await db.saveUser(destinationUser);
    
    return await db.getUser(sourceUser.uuid);
  },

  saveKeys: async (keys) => {
    await client.set(`keys`, JSON.stringify(keys));
  },

  getKeys: async () => {
    const keyString = await client.get('keys');
    return JSON.parse(keyString);
  }

};

export default db;
