'use strict';

(function() {
var fount = require('fount-js');
var sessionless = require('sessionless-node');

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

  app.get('/plugin/fount/user', async function(req, res) {
console.log('getting called here');
    let user;

    if(!uuid) {
      user = await fount.getUserByPublicKey(fountKeys.pubKey);
      if(!user || !user.uuid) {
        user = await fount.createUser(saveKeys, getKeys);   
      }
    } else {
      user = await fount.getUserByUUID(uuid);
    }
console.log('user is: ', user);

    uuid = user.uuid;

    res.send(user);
  });
}

module.exports = {startServer};
}).call(this);
