import { createClient } from 'redis';
import sessionless from 'sessionless-node';

const client = await createClient()
  .on('error', err => console.log('Redis Client Error', err))
  .connect();

const db = {
  getUser: async (uuid) => {
    const user = await client.get(`user:${uuid}`);
    const parsedUser = JSON.parse(user);
    return parsedUser;
  },

  getUserByPublicKey: async (pubKey) => {
    const uuid = await client.get(`pubKey:${pubKey}`);
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

  deleteUser: async (user) => {
    await client.sendCommand(['DEL', `user:${user.uuid}`]);

    return true;
  },

  getNineum: async (user) => {
console.log('getting nineum for: ', user.uuid);
    const nineumString = (await client.get(`user:nineum:${user.uuid}`)) || '{"nineum":[]}';
console.log('nineumString', nineumString);
console.log(JSON.parse(nineumString));
    return JSON.parse(nineumString);
  },

  saveNineum: async (user, newNineum) => {
    const currentNineum = (await db.getNineum(user)).nineum;
console.log('current nineum', currentNineum);
    const allNineum = [...currentNineum, ...newNineum];
    await client.set(`user:nineum:${user.uuid}`, JSON.stringify({nineum: newNineum}));

    const flavorMapJSON = (await client.get('flavorMap')) || '{}';
    const flavorMap = JSON.parse(flavorMapJSON);
    newNineum.forEach(nineum => {
      const flavor = nineum.slice(10, 24);
      if(!flavorMap[flavor]) {
        flavorMap[flavor] = 1;
      } else {
        flavorMap++;
      }
    });
    await client.set('flavorMap', JSON.stringify(flavorMap));

    return true;
  },
 
  countForFlavorOfNineum: async (flavor) => {
    const flavorMapJSON = (await client.get('flavorMap')) || '{}';
    const flavorMap = JSON.parse(flavorMapJSON);
    return flavorMap[flavor] || 0;
  },

  transferNineum: async (sourceUser, destinationUser, nineumToTransfer) => {
    const sourceNineum = (await db.getNineum(sourceUser)).nineum;
    
  }
};

export default db;
