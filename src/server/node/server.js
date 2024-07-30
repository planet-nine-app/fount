import config from './config/local.js';
import express from 'express';
import user from './src/user/user.js';
import sessionless from 'sessionless-node';

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  const requestTime = +req.query.timestamp || +req.body.timestamp;
  const now = new Date().getTime();
  if(Math.abs(now - requestTime) > config.allowedTimeDifference) {
    return res.send({error: 'no time like the present'});
  }
  next();
});

app.put('/user/create', async (req, res) => {
  const pubKey = req.body.pubKey;
  const message = req.body.timestamp +  pubKey;
  const signature = req.body.signature;

  if(!signature || !sessionless.verifySignature(signature, message, pubKey)) {
    res.status(403);
    return res.send({error: 'auth error'});
  }

  const foundUser = await user.putUser(req.body.user);
  res.send(foundUser);
});

app.get('/user/:uuid', async (req, res) => {
  const uuid = req.params.uuid;
  const timestamp = req.query.timestamp;
  const signature = req.query.signature;
  const message = timestamp + uuid;

  const foundUser = await user.getUser(req.params.uuid);

  if(!signature || !sessionless.verifySignature(signature, message, foundUser.pubKey)) {
    res.status(403);
    return res.send({error: 'auth error'});
  }

  res.send(foundUser);
});

app.get('/user/pubKey/:pubKey', async (req, res) => {
  const pubKey = req.params.pubKey;
  const timestamp = req.query.timestamp;
  const signature = req.query.signature;
  const message = timestamp + pubKey;

  const foundUser = await user.getUserByPublicKey(pubKey);

  if(!signature || !sessionless.verifySignature(signature, message, foundUser.pubKey)) {
    res.status(403);
    return res.send({error: 'auth error'});
  }

  res.send(foundUser);
});


