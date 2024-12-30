import express from 'express';
import cors from 'cors';
import { createHash } from 'node:crypto';
import { 
  putUser, 
  getUserByUUID, 
  getUserByPublicKey, 
  getNineum, 
  grantNineum, 
  grantGalacticNineum,
  grantAdminNineum,
  deleteUser 
} from './src/routes/user.js';
import { resolve } from './src/routes/magic.js';
import { grant } from './src/routes/grant.js';
import { transfer } from './src/routes/transfer.js';
import db from './src/persistence/db.js';
import nineum from './src/nineum/nineum.js';
import experience from './src/experience/experience.js';
import sessionless from 'sessionless-node';
import bdo from 'bdo-js';
import addie from 'addie-js';
import spellbook from './spellbooks/spellbook.js';

const allowedTimeDifference = 300000; // keep this relaxed for now

const app = express();
app.use(cors());
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
  console.log(req.path);
  next();
});

const SUBDOMAIN = process.env.SUBDOMAIN || 'dev';
bdo.baseURL = process.env.LOCALHOST ? 'http://localhost:3003/' : `${SUBDOMAIN}.bdo.allyabase.com/`;
addie.baseURL = process.env.LOCALHOST ? 'http://localhost:3005/' : `${SUBDOMAIN}.bdo.allyabase.com/`;

const bdoHashInput = `${SUBDOMAIN}fount`;

const bdoHash = createHash('sha256').update(bdoHashInput).digest('hex');

const repeat = (func) => {
  setTimeout(func, 2000);
};

const bootstrap = async () => {
  try {
    const bdoUUID = await bdo.createUser(bdoHash, spellbook, db.saveKeys, db.getKeys);
console.log(bdoUUID);
    const spellbooks = await bdo.putSpellbook(bdoUUID, bdoHash, spellbook);
    const addieUUID = await addie.createUser(db.saveKeys, db.getKeys);
console.log(addieUUID);
    const fount = {
      uuid: 'fount',
      bdoUUID,
      addieUUID,
      spellbook
    };

    if(!fount.bdoUUID || !fount.addieUUID || spellbooks.length < 1) {
      throw new Error('bootstrap failed');
    }

    await db.saveUser(fount);
  } catch(err) {
console.warn(err);
    repeat(bootstrap);
  }
};

repeat(bootstrap);

app.put('/user/create', putUser);
app.get('/user/:uuid', getUserByUUID);
app.get('/user/pubKey/:pubKey', getUserByPublicKey);
app.get('/user/:uuid/nineum', getNineum);
app.put('/user/:uuid/nineum', grantNineum);
app.put('/user/:uuid/nineum/admin', grantAdminNineum);
app.put('/user/:uuid/nineum/galactic', grantGalacticNineum);
app.delete('/user/:uuid', deleteUser);

app.post('/resolve/:spellName', resolve);

app.post('/user/:uuid/transfer', transfer);

app.post('/user/:uuid/grant', grant);

app.listen(3006);
console.log('hit me!');
