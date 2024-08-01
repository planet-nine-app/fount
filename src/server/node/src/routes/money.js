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

const putStripeCard =  async (req, res) => {
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
      throw handleError('auth error');
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

export {
  getPlaidToken,
  putStripeAccount,
  putStripeCard
};
