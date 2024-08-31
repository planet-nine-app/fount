import express from 'express';
import { putUser, getUserByUUID, getUserByPublicKey, getNineum, deleteUser } from './src/routes/user.js';
import { resolve } from './src/routes/magic.js';
import { grant } from './src/routes/grant.js';
import { transfer } from './src/routes/transfer.js';
import nineum from './src/nineum/nineum.js';
import experience from './src/experience/experience.js';
import sessionless from 'sessionless-node';

const allowedTimeDifference = 300000; // keep this relaxed for now

const app = express();
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
  next();
});

app.put('/user/create', putUser);
app.get('/user/:uuid', getUserByUUID);
app.get('/user/pubKey/:pubKey', getUserByPublicKey);
app.get('/user/:uuid/nineum', getNineum);
app.delete('/user/:uuid', deleteUser);

app.post('/resolve', resolve);

app.post('/user/:uuid/transfer', transfer);

app.post('/user/:uuid/grant', grant);

app.listen(3006);
console.log('hit me!');
