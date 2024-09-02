import sessionless from 'sessionless-node';
import fetch from 'node-fetch';

const get = async (url) => {
  return await fetch(url);
};

const post = async (url, payload) => {
  return await fetch(url, {
    method: 'post',
    body: JSON.stringify(payload),
    headers: {'Content-Type': 'application/json'}
  });
};

const put = async (url, payload) => {
  return await fetch(url, {
    method: 'put',
    body: JSON.stringify(payload),
    headers: {'Content-Type': 'application/json'}
  });
};

const _delete = async (url, payload) => {
  return await fetch(url, {
    method: 'delete',
    body: JSON.stringify(payload),
    headers: {'Content-Type': 'application/json'}
  });
};

const fount = {
  baseURL: 'https://dev.fount.allyabase.com/',

  createUser: async (saveKeys, getKeys) => {
    const keys = await sessionless.generateKeys(saveKeys, getKeys);

    const payload = {
      timestamp: new Date().getTime() + '',
      pubKey: keys.pubKey
    };

    payload.signature = await sessionless.sign(payload.timestamp + payload.pubKey);

    const res = await put(`${fount.baseURL}user/create`, payload);
    const user = await res.json();
    const uuid = user.uuid;

    return uuid;
  },

  getUserByUUID: async (uuid) => {
    const timestamp = new Date().getTime() + '';
    
    const message = timestamp + uuid;
    
    const signature = await sessionless.sign(message);

    const res = await get(`${fount.baseURL}user/${uuid}?signature=${signature}&timestamp=${timestamp}`);
    const user = res.json();

    return user;
  },

  getUserByPublicKey: async (pubKey) => {
    const timestamp = new Date().getTime() + '';
    
    const message = timestamp + pubKey;
    
    const signature = await sessionless.sign(message);

    const res = await get(`${fount.baseURL}user/pubKey/${pubKey}?signature=${signature}&timestamp=${timestamp}`);
    const user = res.json();

    return user;
  },

  resolve: async (spell) => {
    const res = await post(`${fount.baseURL}resolve`, spell);
    const response = await res.json();
    return response;
  },

  grant: async (uuid, destinationUUID, amount, description) => {
    const payload = {
      timestamp: new Date().getTime(),
      destinationUUID,
      amount,
      description
    };

    const message = payload.timestamp + uuid + payload.destinationUUID + payload.amount + payload.description;

    payload.signature = await sessionless.sign(message);

    const res = await post(`${fount.baseURL}user/${uuid}/grant`, payload);
console.log(res);
    const user = await res.json();
    return user;
  },

  getNineum: async (uuid) => {
    const timestamp = new Date().getTime() + '';

    const message = timestamp + uuid;

    const signature = await sessionless.sign(message);

    const res = await get(`${fount.baseURL}user/${uuid}/nineum?timestamp=${timestamp}&signature=${signature}`);
    const nineum = (await res.json()).nineum
    return nineum;
  },

  transferNineum: async (uuid, destinationUUID, nineumUniqueIds, price, currency) => {
    const payload = {
      timestamp: new Date().getTime() + '',
      destinationUUID,
      nineumUniqueIds,
      price: 0,
      currency: 'usd'
    };

    const message = payload.timestamp + uuid + destinationUUID + payload.nineumUniqueIds.join('') + payload.price + payload.currency;

    payload.signature = await sessionless.sign(message);

    const res = await post(`${fount.baseURL}user/${uuid}/transfer`, payload);
    const user = await res.json();
    return user;
  },

  deleteUser: async (uuid) => {
    const timestamp = new Date().getTime() + '';

    const signature = await sessionless.sign(timestamp + uuid);
    const payload = {timestamp, uuid, signature};


    const res = await _delete(`${fount.baseURL}user/${uuid}`, payload);
    return res.status === 200;
  }
};

export default fount;