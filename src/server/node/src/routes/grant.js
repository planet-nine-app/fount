import user from '../user/user.js';
import experience from '../experience/experience.js';
import sessionless from 'sessionless-node';

const grant = async (req, res) => {
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
};

export { grant };
