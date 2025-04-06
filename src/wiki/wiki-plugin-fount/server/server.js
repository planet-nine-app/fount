'use strict';

(function() {
var _fount = require('fount-js');
var sessionless = require('sessionless-node');
let fountUser;

const fount = _fount.default;
fount.baseURL = 'http://127.0.0.1:3006/';

async function startServer(params) {
  const app = params.app;
  const argv = params.argv;
  
  let uuid;

  const fountKeys = {
    privateKey: argv.private_key,
    pubKey: argv.pub_key
  };

  const saveKeys = () => {};
  const getKeys = () => fountKeys;

  await sessionless.generateKeys(saveKeys, getKeys);
  await fount.createUser(saveKeys, getKeys);

  app.get('/plugin/fount/user', async function(req, res) {
console.log('getting called here');
    let user;

    if(!uuid) {
      user = await fount.getUserByPublicKey(fountKeys.pubKey);
console.log('user looks like', user);
      if(!user || !user.uuid) {
        user = await fount.createUser(saveKeys, getKeys);   
      }
    } else {
      user = await fount.getUserByUUID(uuid);
    }
console.log('user is: ', user);
    user.nineum = await fount.getNineum(user.uuid);

    uuid = user.uuid;
    fountUser = user;

    res.send(user);
  });

  app.post('/plugin/fount/resolve', async function(req, res) {
    const payload = req.body;
    const message = JSON.stringify({
      timestamp: payload.timestamp,
      spell: payload.spell,
      casterUUID: payload.casterUUID,
      totalCost: payload.totalCost,
      mp: payload.mp,
      ordinal: payload.ordinal,
    });

    payload.casterSignature = await sessionless.sign(message);

    const resolution = await fount.resolve(payload);
    if(resolution.success) {
      const updatedUser = await fount.getUserByUUID(payload.casterUUID);
      return res.send(updatedUser);
    }
    res.send(resolution);
  });

  app.get('/plugin/fount/user/:pubKey', async function(req, res) {
    fountUser = await fount.getUserByPublicKey(req.params.pubKey);
console.log('getting the user on the server, it looks like: ', fountUser);
    fountUser.nineum = await fount.getNineum(fountUser.uuid);
    res.send(fountUser);
  });

  app.post('/plugin/fount/transfer', async function(req, res) {
    const uuid = req.body.uuid;
    const toUUID = req.body.toUUID;
    const nineum = req.body.nineum;
    const transferNineum = await fount.transferNineum(uuid, toUUID, nineum, 0, 'usd'); // priced transfers not supported yet
console.log('response on server for transfer', transferNineum);
    fountUser = await fount.getUserByPublicKey(req.params.pubKey);
console.log('getting the user on the server, it looks like: ', fountUser);
    fountUser.nineum = await fount.getNineum(fountUser.uuid);
    res.send(fountUser);
  });
}

module.exports = {startServer};
}).call(this);
