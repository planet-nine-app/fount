import fount from '../../src/client/javascript/fount.js';
import sessionless from 'sessionless-node';
import { should } from 'chai';
should();

console.log(fount);

fount.baseURL = 'http://localhost:3006/';

let savedUser = {};
let savedUser2 = {};
let keys = {};
let keys2 = {};
let keysToReturn;
const hash = 'firstHash';
const secondHash = 'secondHash';

it('should register a user', async () => {
  const user = await fount.createUser((k) => { keysToReturn = k; }, () => { return keysToReturn; });
  savedUser = user;
console.log('savedUser from register', savedUser);
  savedUser.uuid.length.should.equal(36);
  keys = keysToReturn;
  keysToReturn = undefined;
});

it('should register another user', async () => {
  const user = await fount.createUser((k) => { keysToReturn = k; }, () => { return keysToReturn; });
  savedUser2 = user;
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

  const message = payload.timestamp + payload.spell + payload.casterUUID + payload.totalCost + payload.mp + payload.ordinal;

/*console.log(keys);
  sessionless.getKeys = () => { return keys; };
console.log(sessionless.getKeys());*/
  await sessionless.generateKeys(() => {}, () => keys);
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

it('should grant galactic nineum', async () => {
console.log('in galactic, and keys are: ', keys);
console.log('and getKeys is: ', sessionless.getKeys());
  const user = await fount.grantGalacticNineum(savedUser.uuid, savedUser2.uuid, '28880014');
console.log('galactic user', user);
  user.experiencePool.should.equal(200);
});

it('should grant admin nineum', async () => {
  const user = await fount.grantAdminNineum(savedUser.uuid, savedUser2.uuid);
console.log('admin user', user);
  user.experiencePool.should.equal(0);
});

it('should grant nineum', async () => {
  const flavor = '24071209a3b3';
  const user = await fount.grantNineum(savedUser.uuid, savedUser2.uuid, flavor);
console.log('nineum user', user);
  user.experiencePool.should.equal(0);
});

it('should get nineum', async () => {
  keysToReturn = keys2;
  const nineum = await fount.getNineum(savedUser2.uuid);
  savedUser2.nineum = nineum;
  savedUser2.nineum.length.should.equal(2);
});

it('it should transfer nineum', async () => {
  keysToReturn = keys;
  const nineum = await fount.getNineum(savedUser.uuid);
  savedUser.nineum = nineum;
  const updatedUser = await fount.transferNineum(savedUser.uuid, savedUser2.uuid, savedUser.nineum, 0, 'usd');
console.log('transfer updated user', updatedUser);
  updatedUser.nineumCount.should.equal(0);
});

it('should delete a user', async () => {
  const res = await fount.deleteUser(savedUser.uuid);
  res.should.equal(true);
});
