import user from '../user/user.js';
import sessionless from 'sessionless-node';

const getPlaidToken = async (req, res) => {
  try {
    const body = req.body;
    const uuid = body.uuid;
    const timestamp = body.timestamp;
    const signature = body.signature;
    const message = timestamp + uuid;
    const foundUser = user.getUser(uuid);

    if(!sessionless.verifySignature(message, signature, foundUser.pubKey)) {
      throw handleError('Authentication error', 'authError');
    }
    const configs = {
      user: {
        client_user_id: uuid,
      },
      client_name: 'Planet Nine',
      products: ['transactions'],
      country_codes: ['US'],
      language: 'en',
    };
    const createTokenResponse = await plaidClient.linkTokenCreate(configs);
    return {
      statusCode: 200,
      body: JSON.stringify(createTokenResponse.data)
    };
  } catch(err) {
    res.status(404);
    res.send({error: err});
  }
};

const getStripePaymentIntent = async (req, res) => {
  try {
console.log('trying to get payment intent');
    const uuid = req.params.uuid;
    const timestamp = req.query.timestamp;
    const amount = req.query.amount;
    const currency = req.query.currency;
    const signature = req.query.signature;

    const foundUser = await user.getUser(uuid);

    const message = uuid + timestamp + amount + currency;
    console.log(message);
    console.log(foundUser.pubKey);
    console.log(signature);
    if(!sessionless.verifySignature(signature, message, foundUser.pubKey)) {
      res.status = 403;
      return res.send({error: 'Auth error'});
    }
console.log('past auth');

    const customerId = foundUser.stripeAccountId || (await stripe.customers.create()).id;
    if(foundUser.stripeAccountId !== customerId) {
      foundUser.stripeAccountId = customerId;
      await user.saveUser(foundUser);
    }
console.log('got customerId');

    const ephemeralKey = await stripe.ephemeralKeys.create(
      {customer: customer.id},
      {apiVersion: '2024-06-20'}
    );
console.log('got ephemeral key');

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      customer: customer.id,
      // In the latest version of the API, specifying the `automatic_payment_methods` parameter
      // is optional because Stripe enables its functionality by default.
      automatic_payment_methods: {
	enabled: true,
      },
    });
console.log('got payment intent');

    res.send({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
      publishableKey: '<publishableKey>'
    });
  } catch(err) {
    res.status = 404;
    res.send({error: err});
  }
};

const putStripeAccount = async (req, res) => {
  try {
    const body = req.body;
    const uuid = body.uuid;
    const publicToken = body.publicToken;
    const accountId = body.accountId;
    const signature = body.signature;
    if(!uuid || !publicToken || !accountId || !signature) {
      throw handleError('Please provide all params', 'inputError');
    }
    const foundUser = await user.getUser(uuid);
    const message = uuid + publicToken + accountId;
    if(!authenticator.checkSignature(message, signature, foundUser.pubKey)) {
      throw handleError('Authentication Error', 'authError');
    }
    const res = await plaidClient.itemPublicTokenExchange({public_token: publicToken});
    const accessToken = res.data.access_token;
    const request = {
      'client_id': '<stripe_client_id>',
      'secret': '<stripe_secret>',
      access_token: accessToken,
      account_id: accountId,
    };
    const stripeTokenResponse = await plaidClient.processorStripeBankAccountTokenCreate(request);
    const bankAccountToken = stripeTokenResponse.data.stripe_bank_account_token;
    const customer = await stripe.customers.create({
      description: userUUID,
      source: bankAccountToken,
    });
    const updatedUser = await user.savePlaidAndStripeTokens(foundUser, accessToken, customer.id);
    return res.send(updatedUser);
  } catch(err) {
    res.status = 404;
    res.send({error: err});
  }
};

const putStripeIssueCard =  async (req, res) => {
  try {
    const body = req.body;
    const timestamp = body.timestamp;
    const uuid = body.uuid;
    const cardHolder = body.cardHolder;
    const signature = body.signature;
    if(!uuid || !cardHolder || !signature) {
      throw handleError('please provide all params');
    }
    const foundUser = await user.getUser(uuid);
    const message = timestamp + uuid + cardHolder // cardHolder needs to be deconstructed
    if(!sessionless.verifySignature(message, signature, foundUser.pubKey)) {
      res.status(403);
      return res.send({error: 'auth error'});
    }
    const cardholder = await stripe.issuing.cardholders.create(cardHolder); // this is bad naming
   // maybe something to do with terms
    const card = await stripe.issuing.cards.create({
      cardholder: cardholder.id,
      currency: 'usd',
      type: 'virtual',
    });
    return {
      statusCode: 200,
      body: JSON.stringify({
        cardholder: cardholder,
        card: card
      })
    };
  } catch(err) {
    res.status = 404;
    res.send({error: err});
  }
};

const putStripeCustomer = async (req, res) => {
  try {
    // Set your secret key. Remember to switch to your live secret key in production.
    // See your keys here: https://dashboard.stripe.com/apikeys
    // const stripe = require('stripe')('stripe-key');

    const body = req.body;
    const uuid = req.params.uuid;
    const timestamp = body.timestamp;
    const name = body.name;
    const email = body.email;
    const signature = body.signature;

    const message = timestamp + uuid + name + email;

    const foundUser = await user.getUser(uuid);

    if(!sessionless.verifySignature(signature, message, foundUser.pubKey)) {
      res.status = 403;
      res.send({error: 'auth error'});
    }

    const customer = await stripe.customers.create({
      name,
      email,
    });

    foundUser.stripeAccountId = customer.id;
    await user.saveUser(foundUser);

    res.send(foundUser);
  } catch(err) {
    res.status = 404;
    res.send({error: err});
  }
};

export {
  getPlaidToken,
  getStripePaymentIntent,
  putStripeAccount,
  putStripeIssueCard,
  putStripeCustomer
};
