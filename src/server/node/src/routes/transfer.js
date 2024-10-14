import user from '../user/user.js';
import nineum from '../nineum/nineum.js';
import sessionless from 'sessionless-node';

const transfer = async (req, res) => {
  const body = req.body;
  const timestamp = body.timestamp;
  const uuid = req.params.uuid;
  const destinationUUID = body.destinationUUID;
  const nineumUniqueIds = body.nineumUniqueIds;
  const price = body.price;
  const currency = body.currency;
  const signature = body.signature;

  const message = timestamp + uuid + destinationUUID + nineumUniqueIds.join('') + price + currency;
console.log(message);
  const sourceUser = await user.getUser(uuid);
console.log('got source user');

  if(!sessionless.verifySignature(signature, message, sourceUser.pubKey)) {
console.log('auth failed');
    res.status(403);
    return res.send({error: 'Auth error'});
  }

  if(price && price !== 0) {
console.log('unimplemented');
    res.status(501);
    return res.send({error: 'unimplemented'});
  }

  const destinationUser = await user.getUser(destinationUUID);

  const updatedUser = await nineum.transferNineum(sourceUser, destinationUser, nineumUniqueIds, price, currency);

console.log('sending updatedUser', updatedUser);

  res.send(updatedUser);
};

export { transfer };
