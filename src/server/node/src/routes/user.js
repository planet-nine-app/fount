import user from '../user/user.js';
import sessionless from 'sessionless-node';

const putUser =  async (req, res) => {
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

  const newUser = req.body.user || { pubKey };

  const foundUser = await user.putUser(newUser, pubKey);

console.log('sending back', foundUser);

  res.send(foundUser);
};

const getUserByUUID =  async (req, res) => {
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
};

const getUserByPublicKey = async (req, res) => {
  const pubKey = req.params.pubKey;
  const timestamp = req.query.timestamp;
  const signature = req.query.signature;
  const message = timestamp + pubKey;

  const foundUser = await user.getUserByPublicKey(pubKey);
console.log(signature);

  if(!signature || !sessionless.verifySignature(signature, message, foundUser.pubKey)) {
    res.status(403);
    return res.send({error: 'auth error'});
  }

console.log('sending back', foundUser);

  res.send(foundUser);
};

const getNineum = async (req, res) => {
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
};

const grantNineum = async (req, res) => {
  const uuid = req.params.uuid;
  const body = req.body;
  const timestamp = body.timestamp;
};

const deleteUser = async (req, res) => {
  const body = req.body;
  const timestamp = body.timestamp;
  const signature = body.signature;
  const uuid = body.uuid;
  const message = timestamp + uuid;

  const foundUser = await user.getUser(uuid);

  if(!signature || !sessionless.verifySignature(signature, message, foundUser.pubKey)) {
    res.status(403);
    return res.send({error: 'auth error'});
  }

console.log('found user uuid', foundUser.uuid);
  const deleted = await user.deleteUser(foundUser.uuid);

  res.send();
};

export {
  putUser,
  getUserByUUID,
  getNineum,
  grantNineum,
  getUserByPublicKey,
  deleteUser
};
