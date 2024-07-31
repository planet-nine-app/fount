import config from '../../config/local.js';
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

  putUser: async (user) => {
    const uuid = sessionless.generateUUID();
    user.uuid = uuid;
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
    return await client.get(`user:nineum:${user.uuid}`);
  },

  saveNineum: async (user, newNineum) => {
    await client.set(`user:nineum:${user.uuid}`, JSON.stringify({nineum: newNineum}));

    return true;
  }
};

export default db;
