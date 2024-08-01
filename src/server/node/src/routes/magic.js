import user from '../user/user.js';
import sessionless from 'sessionless-node';

const resolve = async (req, res) => {
  const payload = req.body;

  let resolved = true;

  for(let i = 0; i < payload.gateways.length; i++) {
    const gateway = payload.gateways[i];
    const gatewayUser = await user.getUser(gateway.uuid);
    const signature = gateway.signature;

    const message = JSON.stringify({
      timestamp: gateway.timestamp,
      uuid: gateway.uuid,
      minimumCost: gateway.minimumCost,
      ordinal: gateway.ordinal
    });

    if(!signature || !sessionless.verifySignature(signature, message, gatewayUser.pubKey)) {
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
};

export { resolve };

