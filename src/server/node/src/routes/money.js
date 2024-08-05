import user from '../user/user.js';
import sessionless from 'sessionless-node';
import { stripeKey, stripePublishingKey } from '../../config/default.js';
import stripe from 'stripe';

const stripeSDK = stripe(stripeKey);

/*const charge = await stripeSDK.charges.create({
      amount: 50000, // Amount in cents
      currency: 'usd',
      source: 'tok_bypassPending', // payment source for user
      description: 'add balance to test acct'
    });
console.log(charge);*/

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

//    const customerId = foundUser.stripeAccountId || (await stripeSDK.customers.create()).id;
    const customerId = (await stripeSDK.customers.create()).id;
console.log('got customer id: ', customerId);
    if(foundUser.stripeAccountId !== customerId) {
      foundUser.stripeAccountId = customerId;
      await user.saveUser(foundUser);
    }
console.log('got customerId');

    const ephemeralKey = await stripeSDK.ephemeralKeys.create(
      {customer: customerId},
      {apiVersion: '2024-06-20'}
    );
console.log('got ephemeral key');

    const groupName = 'group_' + foundUser.uuid;

    const paymentIntent = await stripeSDK.paymentIntents.create({
      amount: amount,
      currency: currency,
      customer: customerId,
      // In the latest version of the API, specifying the `automatic_payment_methods` parameter
      // is optional because Stripe enables its functionality by default.
      automatic_payment_methods: {
	enabled: true,
      },
      transfer_group: groupName
    });
console.log('got payment intent');

    const accounts = ['acct_1PkHxKINZ8AVbJk4', 'acct_1PkKCbIhMl7JdVnG', 'acct_1PkKClIpOfaGPdk4', 'acct_1PkKCrIiyvAW1nsA', 'acct_1PkKCyRIJN1ETtWv', 'acct_1PkKD4Iqfebwhmgc'];
    const transferPromises = accounts.map(account => {
      return stripeSDK.transfers.create({
	amount: 200,
	currency: 'usd',
	destination: account,
	transfer_group: groupName
      });
    });
    await Promise.all(transferPromises);
console.log('transferPromises');
console.log('sending');
    const response = {
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customerId,
      publishableKey: stripePublishingKey
    };
    res.send(response);
  } catch(err) {
console.log(err);
    res.status = 404;
    res.send({error: err});
  }
};

/*const putStripeAccount = async (req, res) => {
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
};*/

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
console.log('past auth');

    const customer = await stripeSDK.customers.create({
      name,
      email,
    });
console.log('got customer', customer);

    foundUser.stripeAccountId = customer.id;
    await user.saveUser(foundUser);

    res.send(foundUser);
  } catch(err) {
console.log(err);
    res.status = 404;
    res.send({error: err});
  }
};

const putStripeAccount = async (req, res) => {
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
console.log('past auth');

    const account = await stripeSDK.accounts.create({
      country: 'US',
      email: email,
      business_type: 'individual',
      tos_acceptance: {
        date: Math.floor((new Date().getTime()) / 1000),
        ip: '97.120.94.145',
        service_agreement: 'full'
      },
      capabilities: {
        transfers: {
          requested: true
        }
      },
      controller: {
	fees: {
	  payer: 'application',
	},
	losses: {
	  payments: 'application',
	},
        requirement_collection: 'application',
	stripe_dashboard: {
	  type: 'none',
	},

      },
    });
console.log('got account', account);

    const retrievedAccount = await stripeSDK.accounts.retrieve(account.id);
console.log(retrievedAccount.capabilities);
console.log(retrievedAccount.requirements);

    await stripeSDK.accounts.update(account.id, {
      individual: {
	first_name: body.firstName,
	last_name: body.lastName,
	dob: body.dob,
	ssn_last_4: body.ssn_last_4,
	address: body.address
      },
      business_profile: body.business_profile,
      external_account: body.external_account
    });

    foundUser.stripeAccountId = account.id;
    await user.saveUser(foundUser);

//    const loginURL = await stripeSDK.accounts.createLoginLink(account.id);
//console.log(loginURL);

    res.send(foundUser);
  } catch(err) {
console.log(err);
    res.status = 404;
    res.send({error: err});
  }
};

export {
  getPlaidToken,
  getStripePaymentIntent,
  putStripeIssueCard,
  putStripeCustomer,
  putStripeAccount
};
