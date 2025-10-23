// MAGIC spells for fount service
// Fount's internal operations (user creation, nineum management, transfers, grants)

const MAGIC = {
  /**
   * fountUserCreate - Create a Fount user
   *
   * Expected spell components:
   * - pubKey: User's public key
   * - user: Optional user object with additional fields
   */
  async fountUserCreate(spell) {
    try {
      console.log('🪄 Fount resolving fountUserCreate spell');

      const { pubKey, user: userData } = spell.components;

      if (!pubKey) {
        return {
          success: false,
          error: 'Missing required spell component: pubKey'
        };
      }

      // Import user module dynamically
      const userModule = await import('../user/user.js');
      const user = userModule.default;

      // Check if user already exists
      try {
        const existingUser = await user.getUserByPublicKey(pubKey);
        if (existingUser) {
          console.log('✅ User already exists:', existingUser.uuid);
          return existingUser;
        }
      } catch (err) {
        // User doesn't exist, continue with creation
      }

      const newUser = userData || { pubKey };
      const createdUser = await user.putUser(newUser, pubKey);

      console.log('✅ User created:', createdUser.uuid);

      return createdUser;

    } catch (error) {
      console.error('❌ fountUserCreate spell failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * fountUserNineum - Grant specific flavored nineum to a user
   *
   * Expected spell components:
   * - uuid: Granter's UUID (must have galactic or admin nineum)
   * - toUserUUID: Recipient's UUID
   * - charge: Charge attribute (01 or 02)
   * - direction: Direction attribute (01-04)
   * - rarity: Rarity attribute (01-05)
   * - size: Size attribute (01-05)
   * - texture: Texture attribute (01-05)
   * - shape: Shape attribute (01-06)
   * - quantity: Number of nineum to grant
   */
  async fountUserNineum(spell) {
    try {
      console.log('🪄 Fount resolving fountUserNineum spell');

      const {
        uuid,
        toUserUUID,
        charge,
        direction,
        rarity,
        size,
        texture,
        shape,
        quantity
      } = spell.components;

      if (!uuid || !toUserUUID || !charge || !direction || !rarity || !size || !texture || !shape || !quantity) {
        return {
          success: false,
          error: 'Missing required spell components'
        };
      }

      // Import modules dynamically
      const userModule = await import('../user/user.js');
      const user = userModule.default;
      const dbModule = await import('../persistence/db.js');
      const db = dbModule.default;
      const nineumModule = await import('../nineum/nineum.js');
      const nineum = nineumModule.default;

      const foundUser = await user.getUser(uuid);
      if (!foundUser) {
        return {
          success: false,
          error: 'Granter user not found'
        };
      }

      const toUser = await user.getUser(toUserUUID);
      if (!toUser) {
        return {
          success: false,
          error: 'Recipient user not found'
        };
      }

      const foundUserNineum = (await db.getNineum(foundUser)).nineum;
      const galacticNineum = foundUserNineum.filter(n => n.slice(14, 16) === 'ff');
      const adminNineum = foundUserNineum.filter(n => n.slice(14, 16) === 'fe');
      const isAllowed = (galacticNineum.length > 0 || adminNineum.length > 0);

      if (!isAllowed) {
        return {
          success: false,
          error: 'User does not have permission to grant nineum'
        };
      }

      const galaxy = (galacticNineum.length >= adminNineum.length ? galacticNineum[0] : adminNineum[0]).slice(2, 10);
      const flavor = charge + direction + rarity + size + texture + shape;
      const grantedNineum = await nineum.constructSpecificFlavorNineum(galaxy, charge, direction, rarity, size, texture, shape, quantity);
      await db.saveNineum(toUser, grantedNineum);

      const updatedToUser = await user.getUser(toUserUUID);

      console.log('✅ Nineum granted to:', toUserUUID);

      return updatedToUser;

    } catch (error) {
      console.error('❌ fountUserNineum spell failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * fountUserNineumAdmin - Grant administrative nineum to a user
   *
   * Expected spell components:
   * - uuid: Granter's UUID (must have galactic nineum)
   * - toUserUUID: Recipient's UUID
   */
  async fountUserNineumAdmin(spell) {
    try {
      console.log('🪄 Fount resolving fountUserNineumAdmin spell');

      const { uuid, toUserUUID } = spell.components;

      if (!uuid || !toUserUUID) {
        return {
          success: false,
          error: 'Missing required spell components: uuid, toUserUUID'
        };
      }

      // Import modules dynamically
      const userModule = await import('../user/user.js');
      const user = userModule.default;
      const dbModule = await import('../persistence/db.js');
      const db = dbModule.default;
      const nineumModule = await import('../nineum/nineum.js');
      const nineum = nineumModule.default;

      const foundUser = await user.getUser(uuid);
      if (!foundUser) {
        return {
          success: false,
          error: 'Granter user not found'
        };
      }

      const toUser = await user.getUser(toUserUUID);
      if (!toUser) {
        return {
          success: false,
          error: 'Recipient user not found'
        };
      }

      const foundUserNineum = (await db.getNineum(foundUser)).nineum;
      const galacticNineum = foundUserNineum.filter(n => n.slice(14, 16) === 'ff');

      if (galacticNineum.length === 0) {
        return {
          success: false,
          error: 'User does not have galactic nineum'
        };
      }

      const galaxy = galacticNineum[0].slice(2, 10);
      const adminNineum = await nineum.constructAdministrativeNineum(galaxy);
      await db.saveNineum(toUser, [adminNineum]);

      const updatedToUser = await user.getUser(toUserUUID);

      console.log('✅ Admin nineum granted to:', toUserUUID);

      return updatedToUser;

    } catch (error) {
      console.error('❌ fountUserNineumAdmin spell failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * fountUserNineumGalactic - Claim galactic nineum for a galaxy
   *
   * Expected spell components:
   * - uuid: User's UUID
   * - galaxy: Galaxy ID (8-character hex string)
   */
  async fountUserNineumGalactic(spell) {
    try {
      console.log('🪄 Fount resolving fountUserNineumGalactic spell');

      const { uuid, galaxy } = spell.components;

      if (!uuid || !galaxy) {
        return {
          success: false,
          error: 'Missing required spell components: uuid, galaxy'
        };
      }

      // Import modules dynamically
      const userModule = await import('../user/user.js');
      const user = userModule.default;
      const dbModule = await import('../persistence/db.js');
      const db = dbModule.default;
      const nineumModule = await import('../nineum/nineum.js');
      const nineum = nineumModule.default;

      const foundUser = await user.getUser(uuid);
      if (!foundUser) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      const isGalaxyOpen = await db.isGalaxyOpen(galaxy);
      if (!isGalaxyOpen) {
        return {
          success: false,
          error: 'Galaxy is already claimed'
        };
      }

      const galacticNineum = await nineum.constructGalacticNineum(galaxy);
      await db.saveNineum(foundUser, [galacticNineum]);

      const updatedUser = await db.getUser(foundUser.uuid);

      console.log('✅ Galactic nineum claimed for galaxy:', galaxy);

      return updatedUser;

    } catch (error) {
      console.error('❌ fountUserNineumGalactic spell failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * fountUserDelete - Delete a Fount user
   *
   * Expected spell components:
   * - uuid: User's UUID
   */
  async fountUserDelete(spell) {
    try {
      console.log('🪄 Fount resolving fountUserDelete spell');

      const { uuid } = spell.components;

      if (!uuid) {
        return {
          success: false,
          error: 'Missing required spell component: uuid'
        };
      }

      // Import user module dynamically
      const userModule = await import('../user/user.js');
      const user = userModule.default;

      const foundUser = await user.getUser(uuid);
      if (!foundUser) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      await user.deleteUser(foundUser.uuid);

      console.log('✅ User deleted:', uuid);

      return {
        success: true
      };

    } catch (error) {
      console.error('❌ fountUserDelete spell failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * fountUserTransfer - Transfer nineum between users
   *
   * Expected spell components:
   * - uuid: Source user's UUID
   * - destinationUUID: Destination user's UUID
   * - nineumUniqueIds: Array of nineum unique IDs to transfer
   * - price: Price for transfer (optional, 0 for free)
   * - currency: Currency for price (optional)
   */
  async fountUserTransfer(spell) {
    try {
      console.log('🪄 Fount resolving fountUserTransfer spell');

      const { uuid, destinationUUID, nineumUniqueIds, price, currency } = spell.components;

      if (!uuid || !destinationUUID || !nineumUniqueIds) {
        return {
          success: false,
          error: 'Missing required spell components: uuid, destinationUUID, nineumUniqueIds'
        };
      }

      if (price && price !== 0) {
        return {
          success: false,
          error: 'Paid transfers not yet implemented'
        };
      }

      // Import modules dynamically
      const userModule = await import('../user/user.js');
      const user = userModule.default;
      const nineumModule = await import('../nineum/nineum.js');
      const nineum = nineumModule.default;

      const sourceUser = await user.getUser(uuid);
      if (!sourceUser) {
        return {
          success: false,
          error: 'Source user not found'
        };
      }

      const destinationUser = await user.getUser(destinationUUID);
      if (!destinationUser) {
        return {
          success: false,
          error: 'Destination user not found'
        };
      }

      const updatedUser = await nineum.transferNineum(sourceUser, destinationUser, nineumUniqueIds, price, currency);

      console.log('✅ Nineum transferred from', uuid, 'to', destinationUUID);

      return updatedUser;

    } catch (error) {
      console.error('❌ fountUserTransfer spell failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * fountUserGrant - Grant experience/MP to another user
   *
   * Expected spell components:
   * - uuid: Granter's UUID
   * - destinationUUID: Recipient's UUID
   * - amount: Amount of experience/MP to grant
   * - description: Description of the grant (optional)
   */
  async fountUserGrant(spell) {
    try {
      console.log('🪄 Fount resolving fountUserGrant spell');

      const { uuid, destinationUUID, amount, description } = spell.components;

      if (!uuid || !destinationUUID || !amount) {
        return {
          success: false,
          error: 'Missing required spell components: uuid, destinationUUID, amount'
        };
      }

      // Import modules dynamically
      const userModule = await import('../user/user.js');
      const user = userModule.default;
      const experienceModule = await import('../experience/experience.js');
      const experience = experienceModule.default;

      const sourceUser = await user.getUser(uuid);
      if (!sourceUser) {
        return {
          success: false,
          error: 'Granter user not found'
        };
      }

      const destinationUser = await user.getUser(destinationUUID);
      if (!destinationUser) {
        return {
          success: false,
          error: 'Recipient user not found'
        };
      }

      const updatedUser = await experience.grant(sourceUser, destinationUser, amount);

      console.log('✅ Experience granted from', uuid, 'to', destinationUUID);

      return updatedUser;

    } catch (error) {
      console.error('❌ fountUserGrant spell failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * save - Save an item to the carrier bag
   *
   * Expected spell components:
   * - feedUrl: URL of the feed to save
   * - collection: Collection name (e.g., "music")
   * - type: Item type (e.g., "canimus-feed")
   * - title: Optional title for the item
   */
  async save(spell) {
    try {
      console.log('🪄 Fount resolving save spell');
      console.log('📦 Saving to carrier bag:', spell.components);

      const { feedUrl, collection, type, title } = spell.components;

      if (!feedUrl || !collection || !type) {
        return {
          success: false,
          error: 'Missing required spell components: feedUrl, collection, type'
        };
      }

      // For now, just return success with the saved item
      // In the future, this would save to BDO carrier bag
      const savedItem = {
        feedUrl,
        collection,
        type,
        title: title || 'Saved Item',
        savedAt: Date.now()
      };

      console.log('✅ Item saved to carrier bag:', savedItem);

      return {
        success: true,
        data: savedItem,
        message: `Saved ${title || type} to ${collection} collection`
      };

    } catch (error) {
      console.error('❌ save spell failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

export default MAGIC;
