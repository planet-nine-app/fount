import user from '../user/user.js';
import sessionless from 'sessionless-node';

const resolve = async (req, res) => {
  try {
console.log('should resolve');
    const spellName = req.params.spellName;
    const payload = req.body;

    let resolved = true;

    const gatewayUsers = [];

    for(let i = 0; i < payload.gateways.length; i++) {
      const gateway = payload.gateways[i];
      const gatewayUser = await user.getUser(gateway.uuid);
      gatewayUsers.push(gatewayUser);
      const signature = gateway.signature;

      const message = gateway.timestamp + gateway.uuid + gateway.minimumCost + gateway.ordinal;

      if(!signature || !sessionless.verifySignature(signature, message, gatewayUser.pubKey)) {
	resolved = false;
      }
    }

console.log('About to try and get caster: ', payload.casterUUID);
    const caster = await user.getUser(payload.casterUUID);
    const message = payload.timestamp + payload.spell + payload.casterUUID + payload.totalCost + payload.mp + payload.ordinal;

    if(!sessionless.verifySignature(payload.casterSignature, message, caster.pubKey)) {
      resolved = false;
    }

    if(payload.mp) {
      resolved = await user.spendMP(caster, payload.totalCost);
    } else {
      // resolved = await user.spendMoney(caster, payload, gatewayUsers, payload.totalCost);
    }

    if(resolved) {
      const signatureMap = {};
      return res.send({
	success: true,
	signatureMap
      });
    }
    res.status(403);
    res.send({success: false});
  } catch(err) {
console.warn(err);
    res.status(900);
    res.send({success: false});
  }
};

export { resolve };

