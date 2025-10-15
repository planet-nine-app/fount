import { should } from 'chai';
should();
import sessionless from 'sessionless-node';
import fount from 'fount-js';

const baseURL = process.env.SUB_DOMAIN ? `https://${process.env.SUB_DOMAIN}.fount.allyabase.com/` : 'http://127.0.0.1:3006/';
fount.baseURL = baseURL;

let keys1 = {};
let keys2 = {};
let fountUser1 = {};
let fountUser2 = {};
let testGalaxy = null;

describe('Fount MAGIC Spell Tests', () => {

  before(async () => {
    // Generate keys for two test users
    keys1 = await sessionless.generateKeys(() => { return keys1; }, () => { return keys1; });
    keys2 = await sessionless.generateKeys(() => { return keys2; }, () => { return keys2; });

    // Create first fount user for spell casting
    fountUser1 = await fount.createUser(() => keys1, () => keys1);
    console.log('Created fount user 1:', fountUser1.uuid);

    // Generate a test galaxy ID (8-character hex string)
    testGalaxy = sessionless.generateUUID().substring(0, 8);
    console.log('Test galaxy:', testGalaxy);
  });

  it('should create user via fountUserCreate spell', async () => {
    const timestamp = Date.now().toString();

    const spell = {
      spell: 'fountUserCreate',
      casterUUID: fountUser1.uuid,
      timestamp,
      totalCost: 50,
      mp: true,
      ordinal: 0,
      components: {
        pubKey: keys2.pubKey
      }
    };

    // Sign the spell
    const message = timestamp + spell.spell + spell.casterUUID + spell.totalCost + spell.mp + spell.ordinal;
    spell.casterSignature = await sessionless.sign(message, keys1.privateKey);

    // Cast the spell
    const result = await fount.castSpell('fountUserCreate', spell);

    console.log('fountUserCreate result:', result);

    result.should.have.property('uuid');
    result.should.have.property('pubKey', keys2.pubKey);

    fountUser2 = result;
  });

  it('should claim galactic nineum via fountUserNineumGalactic spell', async () => {
    const timestamp = Date.now().toString();

    const spell = {
      spell: 'fountUserNineumGalactic',
      casterUUID: fountUser1.uuid,
      timestamp,
      totalCost: 50,
      mp: true,
      ordinal: 1,
      components: {
        uuid: fountUser1.uuid,
        galaxy: testGalaxy
      }
    };

    const message = timestamp + spell.spell + spell.casterUUID + spell.totalCost + spell.mp + spell.ordinal;
    spell.casterSignature = await sessionless.sign(message, keys1.privateKey);

    const result = await fount.castSpell('fountUserNineumGalactic', spell);

    console.log('fountUserNineumGalactic result:', result);

    result.should.have.property('uuid');
    result.should.have.property('nineum');
    result.nineum.should.be.an('array');
    result.nineum.length.should.be.greaterThan(0);
  });

  it('should grant admin nineum via fountUserNineumAdmin spell', async () => {
    const timestamp = Date.now().toString();

    const spell = {
      spell: 'fountUserNineumAdmin',
      casterUUID: fountUser1.uuid,
      timestamp,
      totalCost: 50,
      mp: true,
      ordinal: 2,
      components: {
        uuid: fountUser1.uuid,
        toUserUUID: fountUser2.uuid
      }
    };

    const message = timestamp + spell.spell + spell.casterUUID + spell.totalCost + spell.mp + spell.ordinal;
    spell.casterSignature = await sessionless.sign(message, keys1.privateKey);

    const result = await fount.castSpell('fountUserNineumAdmin', spell);

    console.log('fountUserNineumAdmin result:', result);

    result.should.have.property('uuid');
    result.should.have.property('nineum');
    result.nineum.should.be.an('array');
  });

  it('should grant flavored nineum via fountUserNineum spell', async () => {
    const timestamp = Date.now().toString();

    const spell = {
      spell: 'fountUserNineum',
      casterUUID: fountUser1.uuid,
      timestamp,
      totalCost: 50,
      mp: true,
      ordinal: 3,
      components: {
        uuid: fountUser1.uuid,
        toUserUUID: fountUser2.uuid,
        charge: '01', // positive
        direction: '01', // north
        rarity: '01', // common
        size: '01', // tiny
        texture: '01', // satin
        shape: '01', // sphere
        quantity: 3
      }
    };

    const message = timestamp + spell.spell + spell.casterUUID + spell.totalCost + spell.mp + spell.ordinal;
    spell.casterSignature = await sessionless.sign(message, keys1.privateKey);

    const result = await fount.castSpell('fountUserNineum', spell);

    console.log('fountUserNineum result:', result);

    result.should.have.property('uuid');
    result.should.have.property('nineum');
    result.nineum.should.be.an('array');
  });

  it('should transfer nineum via fountUserTransfer spell', async () => {
    const timestamp = Date.now().toString();

    // Get user2's nineum to find IDs to transfer
    const user2Data = await fount.getUser(fountUser2.uuid, () => keys2);
    const nineumToTransfer = user2Data.nineum.slice(0, 1); // Transfer 1 nineum

    const spell = {
      spell: 'fountUserTransfer',
      casterUUID: fountUser2.uuid,
      timestamp,
      totalCost: 50,
      mp: true,
      ordinal: 4,
      components: {
        uuid: fountUser2.uuid,
        destinationUUID: fountUser1.uuid,
        nineumUniqueIds: nineumToTransfer,
        price: 0,
        currency: 'usd'
      }
    };

    const message = timestamp + spell.spell + spell.casterUUID + spell.totalCost + spell.mp + spell.ordinal;
    spell.casterSignature = await sessionless.sign(message, keys2.privateKey);

    const result = await fount.castSpell('fountUserTransfer', spell);

    console.log('fountUserTransfer result:', result);

    result.should.have.property('uuid');
    result.should.have.property('nineum');
  });

  it('should grant experience via fountUserGrant spell', async () => {
    const timestamp = Date.now().toString();

    const spell = {
      spell: 'fountUserGrant',
      casterUUID: fountUser1.uuid,
      timestamp,
      totalCost: 50,
      mp: true,
      ordinal: 5,
      components: {
        uuid: fountUser1.uuid,
        destinationUUID: fountUser2.uuid,
        amount: 100,
        description: 'Test experience grant'
      }
    };

    const message = timestamp + spell.spell + spell.casterUUID + spell.totalCost + spell.mp + spell.ordinal;
    spell.casterSignature = await sessionless.sign(message, keys1.privateKey);

    const result = await fount.castSpell('fountUserGrant', spell);

    console.log('fountUserGrant result:', result);

    result.should.have.property('uuid');
    result.should.have.property('experience');
  });

  it('should delete user via fountUserDelete spell', async () => {
    const timestamp = Date.now().toString();

    const spell = {
      spell: 'fountUserDelete',
      casterUUID: fountUser2.uuid,
      timestamp,
      totalCost: 50,
      mp: true,
      ordinal: 6,
      components: {
        uuid: fountUser2.uuid
      }
    };

    const message = timestamp + spell.spell + spell.casterUUID + spell.totalCost + spell.mp + spell.ordinal;
    spell.casterSignature = await sessionless.sign(message, keys2.privateKey);

    const result = await fount.castSpell('fountUserDelete', spell);

    console.log('fountUserDelete result:', result);

    result.should.have.property('success', true);
  });

  it('should fail to create user with missing pubKey', async () => {
    const timestamp = Date.now().toString();

    const spell = {
      spell: 'fountUserCreate',
      casterUUID: fountUser1.uuid,
      timestamp,
      totalCost: 50,
      mp: true,
      ordinal: 7,
      components: {
        // Missing pubKey
      }
    };

    const message = timestamp + spell.spell + spell.casterUUID + spell.totalCost + spell.mp + spell.ordinal;
    spell.casterSignature = await sessionless.sign(message, keys1.privateKey);

    const result = await fount.castSpell('fountUserCreate', spell);

    result.should.have.property('success', false);
    result.should.have.property('error');
  });

  it('should fail to claim already claimed galaxy', async () => {
    const timestamp = Date.now().toString();

    const spell = {
      spell: 'fountUserNineumGalactic',
      casterUUID: fountUser1.uuid,
      timestamp,
      totalCost: 50,
      mp: true,
      ordinal: 8,
      components: {
        uuid: fountUser1.uuid,
        galaxy: testGalaxy // Already claimed
      }
    };

    const message = timestamp + spell.spell + spell.casterUUID + spell.totalCost + spell.mp + spell.ordinal;
    spell.casterSignature = await sessionless.sign(message, keys1.privateKey);

    const result = await fount.castSpell('fountUserNineumGalactic', spell);

    result.should.have.property('success', false);
    result.should.have.property('error', 'Galaxy is already claimed');
  });

  it('should fail to grant nineum with missing components', async () => {
    const timestamp = Date.now().toString();

    const spell = {
      spell: 'fountUserNineum',
      casterUUID: fountUser1.uuid,
      timestamp,
      totalCost: 50,
      mp: true,
      ordinal: 9,
      components: {
        uuid: fountUser1.uuid,
        toUserUUID: fountUser1.uuid
        // Missing flavor components
      }
    };

    const message = timestamp + spell.spell + spell.casterUUID + spell.totalCost + spell.mp + spell.ordinal;
    spell.casterSignature = await sessionless.sign(message, keys1.privateKey);

    const result = await fount.castSpell('fountUserNineum', spell);

    result.should.have.property('success', false);
    result.should.have.property('error');
  });

});
