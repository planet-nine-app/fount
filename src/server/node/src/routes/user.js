import user from '../user/user.js';
import db from '../persistence/db.js';
import nineum from '../nineum/nineum.js';
import sessionless from 'sessionless-node';

const putUser =  async (req, res) => {
  try {
    const pubKey = req.body.pubKey;
    const message = req.body.timestamp +  pubKey;
    const signature = req.body.signature;
  console.log(req.body.timestamp);

    if(!signature || !sessionless.verifySignature(signature, message, pubKey)) {
  console.log(signature);
  console.log(message);
  console.log(pubKey);
  console.log('auth error');
      res.status(403);
      return res.send({error: 'auth error'});
    }

    try {
      const maybeUser = await user.getUserByPublicKey(pubKey);
      return res.send(maybeUser);
    } catch(err) {
console.warn(err);
    }

    const newUser = req.body.user || { pubKey };

    const foundUser = await user.putUser(newUser, pubKey);

  console.log('sending back', foundUser);

    res.send(foundUser);
  } catch(err) {
console.warn(err);
    res.status(404);
    res.send({error: 'not found'});
  }
};

const getUserByUUID =  async (req, res) => {
  try {
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
  } catch(err) {
console.warn(err);
    res.status(404);      
    res.send({error: 'not found'});
  }
};

const getUserByPublicKey = async (req, res) => {
  try {
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
  } catch(err) {
console.warn(err);
    res.status(404);      
    res.send({error: 'not found'});
  }
};

const getNineum = async (req, res) => {
  try { 
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
  } catch(err) {
console.warn(err);
    res.status(404);      
    res.send({error: 'not found'});
  }
};

const grantNineum = async (req, res) => {
  try {
    const uuid = req.params.uuid;
    const body = req.body;
    const timestamp = body.timestamp;
    const toUserUUID = body.toUserUUID;
    const charge = body.charge;
    const direction = body.direction;
    const rarity = body.rarity;
    const size = body.size;
    const texture = body.texture;
    const shape = body.shape;
    const quantity = body.quantity;
    const signature = body.signature;

    const flavor = charge + direction + rarity + size + texture + shape;

    const message = timestamp + uuid + toUserUUID + flavor + quantity;
console.log('message', message);

    const foundUser = await user.getUser(uuid);

    if(!signature || !sessionless.verifySignature(signature, message, foundUser.pubKey)) {
      res.status(403);
      return res.send({error: 'auth error'});
    }

    const toUser = await user.getUser(toUserUUID);
    if(!toUser) {
      throw new Error('no to user found');
    }

    const foundUserNineum = (await db.getNineum(foundUser)).nineum;

    const galacticNineum = foundUserNineum.filter(nineum => nineum.slice(14, 16) === 'ff');
    const adminNineum = foundUserNineum.filter(nineum => nineum.slice(14, 16) === 'fe');
    const isAllowed = (galacticNineum.length > 0 || adminNineum.length > 0);
    if(isAllowed) {
      const galaxy = (galacticNineum.length >= adminNineum.length ? galacticNineum[0] : adminNineum[0]).slice(2, 10);
      const grantedNineum = await nineum.constructSpecificFlavorNineum(galaxy, charge, direction, rarity, size, texture, shape, quantity);
      await db.saveNineum(toUser, grantedNineum);
      const updatedToUser = await user.getUser(toUserUUID);
      return res.send(updatedToUser);
    }

    res.status(404);
    res.send({error: 'not found'});
  } catch(err) {
console.warn(err);
    res.status(404);
    res.send({error: 'not found'});
  }
};

const segmentNineum = async (req, res) => {
  
};

const grantAdminNineum = async (req, res) => {
  try {
    const uuid = req.params.uuid;
    const body = req.body;
    const timestamp = body.timestamp;
    const toUserUUID = body.toUserUUID;
    const signature = body.signature;
    const message = timestamp + uuid;

    const foundUser = await user.getUser(uuid);

    if(!signature || !sessionless.verifySignature(signature, message, foundUser.pubKey)) {
      res.status(403);
      return res.send({error: 'auth error'});
    }

    const toUser = await user.getUser(toUserUUID);
    if(!toUser) {
      throw new Error('no to user found');
    }

    const foundUserNineum = (await db.getNineum(foundUser)).nineum;

    const galacticNineum = foundUserNineum.filter(nineum => nineum.slice(14, 16) === 'ff');
    if(galacticNineum.length > 0) {
      const galaxy = galacticNineum[0].slice(2, 10);
      const adminNineum = await nineum.constructAdministrativeNineum(galaxy);
      await db.saveNineum(toUser, [adminNineum]);
      const updatedToUser = await user.getUser(toUserUUID);
      return res.send(updatedToUser);
    }

    res.status(403);
    res.send({error: 'no galaxy'});
  } catch(err) {
console.warn(err);
    res.status(404);
    res.send({error: 'not found'});
  }
};

const grantGalacticNineum = async (req, res) => {
  try {
    const uuid = req.params.uuid;
    const body = req.body;
    const timestamp = body.timestamp;
    const galaxy = body.galaxy;
    const signature = body.signature;
    const message = timestamp + uuid + galaxy;
console.log('message for galactic: ', message);

    const foundUser = await user.getUser(uuid);

    if(!signature || !sessionless.verifySignature(signature, message, foundUser.pubKey)) {
      res.status(403);
      return res.send({error: 'auth error'});
    }

    const isGalaxyOpen = (await db.isGalaxyOpen(galaxy));
    if(isGalaxyOpen) {
      const galacticNineum = await nineum.constructGalacticNineum(galaxy);
      await db.saveNineum(foundUser, [galacticNineum]);
      const updatedUser = await db.getUser(foundUser.uuid);
      return res.send(updatedUser);
    }

    res.status(403);
    res.send({error: 'galaxy in use'});
  } catch(err) {
console.warn('galaxy err', err);
    res.status(404);
    res.send({error: 'not found'});
  }
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
  grantGalacticNineum,
  grantAdminNineum,
  getUserByPublicKey,
  deleteUser
};
