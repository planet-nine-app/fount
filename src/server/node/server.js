import express from 'express';
import user from './src/user/user.js';
import nineum from './src/nineum/nineum.js';
import experience from './src/experience/experience.js';
import sessionless from 'sessionless-node';

const allowedTimeDifference = 300000; // keep this relaxed for now

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  const requestTime = +req.query.timestamp || +req.body.timestamp;
  const now = new Date().getTime();
  if(Math.abs(now - requestTime) > allowedTimeDifference) {
    return res.send({error: 'no time like the present'});
  }
  next();
});

app.use((req, res, next) => {
  console.log('\n\n', req.body, '\n\n');
  next();
});

app.put('/user/create', async (req, res) => {
  const pubKey = req.body.pubKey;
  const message = req.body.timestamp +  pubKey;
  const signature = req.body.signature;
console.log(req.body.timestamp);

  if(!signature || !sessionless.verifySignature(signature, message, pubKey)) {
console.log(signature);
console.log(message);
console.log(pubKey);
    res.status(403);
    return res.send({error: 'auth error'});
  }

  const foundUser = await user.putUser(req.body.user, pubKey);

console.log('sending back', foundUser);

  res.send(foundUser);
});

app.get('/user/:uuid', async (req, res) => {
  const uuid = req.params.uuid;
  const timestamp = req.query.timestamp;
  const signature = req.query.signature;
  const message = timestamp + uuid;

  const foundUser = await user.getUser(req.params.uuid);

  if(!signature || !sessionless.verifySignature(signature, message, foundUser.pubKey)) {
    res.status(403);
    return res.send({error: 'auth error'});
  }

console.log('sending back', foundUser);

  res.send(foundUser);
});

app.get('/user/pubKey/:pubKey', async (req, res) => {
  const pubKey = req.params.pubKey;
  const timestamp = req.query.timestamp;
  const signature = req.query.signature;
  const message = timestamp + pubKey;

  const foundUser = await user.getUserByPublicKey(pubKey);

  if(!signature || !sessionless.verifySignature(signature, message, foundUser.pubKey)) {
    res.status(403);
    return res.send({error: 'auth error'});
  }

console.log('sending back', foundUser);

  res.send(foundUser);
});

app.get('/user/:uuid/nineum', async (req, res) => {
  const uuid = req.params.uuid;
  const timestamp = req.query.timestamp;
  const signature = req.query.signature;
  const message = timestamp + uuid;

  const foundUser = await user.getUser(uuid);

  if(!signature || !sessionless.verifySignature(signature, message, foundUser.pubKey)) {
    res.status(403);
    return res.send({error: 'auth error'});
  }

  const nineum = await user.getNineum(foundUser);

  res.send(nineum);
});

app.post('/resolve', async (req, res) => {
  const payload = req.body;

  let resolved = true;

  for(let i = 0; i < payload.gateways.length; i++) {
    const gateway = payload.gateways[i];
    const user = await getUser(gateway.uuid);
    const signature = gateway.signature;

    const message = JSON.stringify({
      timestamp: gateway.timestamp,
      uuid: gateway.uuid,
      minimumCost: gateway.minimumCost,
      ordinal: gateway.ordinal
    });
  
    if(!signature || !sessionless.verifySignature(signature, message, user.pubKey)) {
      resolved = false;
    }
  }

  const caster = await user.getUser(payload.casterUUID);
  const message = JSON.stringify({
    timestamp: payload.timestamp,
    spell: payload.spell,
    casterUUID: payload.casterUUID,
    totalCost: payload.totalCost,
    mp: payload.mp,
    ordinal: payload.ordinal,
  });

  if(!sessionless.verifySignature(payload.casterSignature, message, caster.pubKey)) {
    resolved = false;
  }

  resolved = await user.spendMP(caster, payload.mp);

  if(resolved) {
    const signatureMap = {};
    return res.send({
      success: true,
      signatureMap
    });
  } 
  res.status(403);
  res.send({success: false});
});

app.post('/user/:uuid/transfer', async (req, res) => {
  const body = req.body;
  const timestamp = body.timestamp;
  const uuid = req.params.uuid;
  const destinationUUID = body.destinationUUID;
  const nineumUniqueIds = body.nineumUniqueIds;
  const price = body.price;
  const currency = body.currency;
  const signature = body.signature;

  const message = timestamp + uuid + destinationUUID + nineumUniqueIds.join('') + price + currency;
  const sourceUser = await user.getUser(uuid);
  
  if(!sessionless.verifySignature(signature, message, sourceUser.pubKey)) {
    res.status(403);
    return res.send({error: 'Auth error'});
  }

  if(price && price !== 0) {
    res.status(501);
    return res.send({error: 'unimplemented'});
  }

  const destinationUser = await user.getUser(destinationUUID);

  const updatedUser = await nineum.transferNineum(sourceUser, destinationUser, nineumUniqueIds, price, currency);

  res.send(updatedUser);
});

app.post('/user/:uuid/grant', async (req, res) => {
  const body = req.body;
  const timestamp = body.timestamp;
  const uuid = req.params.uuid;
  const destinationUUID = body.destinationUUID;
  const amount = body.amount;
  const description = body.description;
  const signature = body.signature;

  const message = timestamp + uuid + destinationUUID + amount + description;
  const sourceUser = await user.getUser(uuid);

  if(!sessionless.verifySignature(signature, message, sourceUser.pubKey)) {
console.log('auth erere');
console.log(message);
    res.status(403);
    return res.send({error: 'Auth error'});
  } 
console.log('here');
  const destinationUser = await user.getUser(destinationUUID);
console.log('there');
  const updatedUser = await experience.grant(sourceUser, destinationUser, amount);

console.log('sending back', updatedUser);

  res.send(updatedUser);
});

app.listen(3000);
console.log('hit me!');
