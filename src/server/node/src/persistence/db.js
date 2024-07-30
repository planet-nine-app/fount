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
console.log(`parsedUser: ${JSON.stringify(parsedUser)}`);
console.log(uuid);
    const currentKeys = await sessionless.getKeys();
    parsedUser.keys.interactingKeys.julia = currentKeys.pubKey;
    parsedUser.pendingPrompts = await db.getPendingPrompts(parsedUser);
    parsedUser.messages = await db.getMessages(parsedUser);
    return parsedUser;
  },

  putUser: async (user) => {
    const uuid = sessionless.generateUUID();
    user.uuid = uuid;
    user.keys = {
      interactingKeys: {},
      coordinatingKeys: {}
    };
    await client.set(`user:${uuid}`, JSON.stringify(user));
    return uuid;
  },

  saveUser: async (user) => {
    await client.set(`user:${user.uuid}`, JSON.stringify(user));
    return true;
  },

  deleteUser: async (user) => {
    const resp = await client.sendCommand(['DEL', `user:${user.uuid}`]);

    return true;
  },
};

export default db;
