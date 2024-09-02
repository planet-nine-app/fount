import fount from '../../src/client/javascript/fount.js';
import sessionless from 'sessionless-node';
import { should } from 'chai';
should();

console.log(fount);

let savedUser = {};
let savedUser2 = {};
let keys = {};
let keys2 = {};
let keysToReturn = {};
const hash = 'firstHash';
const secondHash = 'secondHash';

it('should register a user', async () => {
  const uuid = await fount.createUser((k) => { keysToReturn = k; }, () => { return keysToReturn; });
  savedUser.uuid = uuid;
  savedUser.uuid.length.should.equal(36);
  keys = keysToReturn;
});

it('should register another user', async () => {
  const uuid = await fount.createUser((k) => { keysToReturn = k; }, () => { return keysToReturn; });
  savedUser2.uuid = uuid;
  savedUser2.uuid.length.should.equal(36);
  keys2 = keysToReturn;
  keysToReturn = keys;
});

it('should get user by uuid', async () => {
  const user = await fount.getUserByUUID(savedUser.uuid);
  user.uuid.length.should.equal(36);
});

it('should get user by pubKey', async () => {
  const user = await fount.getUserByPublicKey(keys.pubKey);
  user.uuid.length.should.equal(36);
});

it('should resolve a spell', async () => {
  const payload = {
    "timestamp": new Date().getTime() + '',
    "spell": "test",
    "casterUUID": savedUser.uuid,
    "totalCost": 400,
    "mp": 400,
    "ordinal": savedUser.ordinal,
    "gateways": []
  };

  const message = JSON.stringify({
    timestamp: payload.timestamp,
    spell: payload.spell,
    casterUUID: payload.casterUUID,
    totalCost: payload.totalCost,
    mp: payload.mp,
    ordinal: payload.ordinal,
  });

console.log(keys);
  sessionless.getKeys = () => { return keys; };
console.log(sessionless.getKeys());
  payload.casterSignature = await sessionless.sign(message);

  const res = await fount.resolve(payload);
console.log(res);
  res.success.should.equal(true);
});

it('should grant experience', async () => {
  keysToReturn = keys2;
  savedUser2 = await fount.grant(savedUser2.uuid, savedUser.uuid, 200, 'here is a test');

  keysToReturn = keys;
  savedUser = await fount.getUserByUUID(savedUser.uuid);

console.log('grant saved user', savedUser);
  savedUser.experiencePool.should.equal(200);
});

it('should get nineum', async () => {
  const nineum = await fount.getNineum(savedUser.uuid);
  savedUser.nineum = nineum;
  savedUser.nineum.length.should.equal(2);
});

it('it should transfer nineum', async () => {
  const updatedUser = await fount.transferNineum(savedUser.uuid, savedUser2.uuid, savedUser.nineum, 0, 'usd');
console.log('transfer updated user', updatedUser);
  updatedUser.nineumCount.should.equal(0);
});

it('should delete a user', async () => {
  const res = await fount.deleteUser(savedUser.uuid);
  res.should.equal(true);
});
