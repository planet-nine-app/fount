import user from '../user/user.js';
import sessionless from 'sessionless-node';

const resolve = async (req, res) => {
  try {
console.log('should resolve');
    const spellName = req.params.spellName;
    const spell = req.body;

    let resolved = true;

    const gatewayUsers = [];

    if(spell.gateways && spell.gateways.length > 0) {
      for(let i = 0; i < spell.gateways.length; i++) {
        if(gateway.signature.length < 5) {
          continue;
        }

	const gateway = spell.gateways[i];
	const gatewayUser = await user.getUser(gateway.uuid);
	gatewayUsers.push(gatewayUser);
	const signature = gateway.signature;

	const message = gateway.timestamp + gateway.uuid + gateway.minimumCost + gateway.ordinal;

	if(!signature || !sessionless.verifySignature(signature, message, gatewayUser.pubKey)) {
	  resolved = false;
	}
      }
    }

console.log('About to try and get caster: ', spell.casterUUID);
    const caster = await user.getUser(spell.casterUUID);
    const message = spell.timestamp + spell.spell + spell.casterUUID + spell.totalCost + spell.mp + spell.ordinal;

    if(!sessionless.verifySignature(spell.casterSignature, message, caster.pubKey)) {
      resolved = false;
    }

    if(spell.mp) {
      if(caster.mp >= spell.totalCost) {
        resolved = await user.spendMP(caster, spell.totalCost);
      } else {
        resolved = false;
      }
    } else {
      resolved = await user.spendMoney(caster, spell, gatewayUsers);
    }

    if(resolved) {
console.log('resolved', resolved);
      const signatureMap = {};
      return res.send({
	success: true,
	signatureMap
      });
    }
    res.status(900);
    res.send({success: false});
  } catch(err) {
console.warn(err);
    res.status(900);
    res.send({success: false});
  }
};

export { resolve };

