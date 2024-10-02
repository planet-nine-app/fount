import db from '../persistence/db.js';
import sessionless from 'sessionless-node';

const checkGalaxy = async (req, res) => {
  try {
    

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

export { checkGalaxy };

