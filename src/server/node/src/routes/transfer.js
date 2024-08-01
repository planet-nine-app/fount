import user from '../user/user.js';
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
};

export { transfer };
