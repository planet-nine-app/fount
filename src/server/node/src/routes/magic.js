import user from '../user/user.js';
import sessionless from 'sessionless-node';
import spellbook from '../../spellbooks/spellbook.js';
import nineum from '../nineum/nineum.js';
import db from '../persistence/db.js';

// Check if user has sufficient MP and required nineum permissions for spell
const checkMPAndNineumPermissions = async (casterUUID, spellName, totalCost) => {
  try {
    const caster = await user.getUser(casterUUID);

    // 1. Check MP (Magic Power) - the regenerating resource
    console.log(`⚡ Checking MP: user has ${caster.mp}, spell costs ${totalCost}`);

    if (caster.mp < totalCost) {
      return {
        success: false,
        error: 'Insufficient MP',
        available: caster.mp,
        required: totalCost,
        type: 'mp'
      };
    }

    // 2. Check Nineum permissions - the permissionable asset
    const spell = spellbook[spellName];
    if (spell?.requiredNineum) {
      console.log(`💎 Checking nineum permissions for ${spellName}:`, spell.requiredNineum);

      const hasPermission = await checkNineumPermission(caster, spell.requiredNineum);
      if (!hasPermission.success) {
        return {
          success: false,
          error: 'Missing required nineum permission',
          required: spell.requiredNineum,
          type: 'nineum',
          details: hasPermission.details
        };
      }
    }

    return { success: true };
  } catch(err) {
    return { success: false, error: err.message };
  }
};

// Check if user has nineum with the required galaxy+system+flavor
const checkNineumPermission = async (caster, requiredNineum) => {
  try {
    const { galaxy, system, flavor } = requiredNineum;

    // Get user's nineum collection
    const userNineum = caster.nineum || [];

    console.log(`🔍 Looking for nineum with galaxy:${galaxy}, system:${system}, flavor:${flavor}`);
    console.log(`👤 User has ${userNineum.length} nineum pieces`);

    // Check if user has any nineum matching the required galaxy+system+flavor
    const matchingNineum = userNineum.find(nineumId => {
      // Parse nineum structure: galaxy(2) + system(8) + flavor(12) + year(2) + ordinal(8)
      if (nineumId.length !== 32) return false;

      const nineumGalaxy = nineumId.substring(0, 2);
      const nineumSystem = nineumId.substring(2, 10);
      const nineumFlavor = nineumId.substring(10, 22);

      const matches = nineumGalaxy === galaxy &&
                     nineumSystem === system &&
                     nineumFlavor === flavor;

      if (matches) {
        console.log(`✅ Found matching nineum: ${nineumId}`);
      }

      return matches;
    });

    if (matchingNineum) {
      return { success: true, matchingNineum };
    } else {
      return {
        success: false,
        details: `No nineum found with galaxy:${galaxy}, system:${system}, flavor:${flavor}`
      };
    }

  } catch(err) {
    return { success: false, details: err.message };
  }
};

// Get the next lower permission level that a user can grant
const getGrantablePermission = (userNineum) => {
  const PERMISSION_HIERARCHY = {
    'ff': { level: 5, name: 'Galactic', grants: 'fe' },      // Galactic -> Constellation
    'fe': { level: 4, name: 'Constellation', grants: 'fd' }, // Constellation -> Scalar
    'fd': { level: 3, name: 'Scalar', grants: 'fc' },        // Scalar -> Stellation
    'fc': { level: 2, name: 'Stellation', grants: 'fb' },    // Stellation -> World
    'fb': { level: 1, name: 'World', grants: null }          // World -> nothing
  };

  let highestPermission = null;
  let highestLevel = 0;

  // Find the highest permission level the user has
  for (const nineumId of userNineum) {
    if (nineumId.length !== 32) continue;

    // Permission is at positions 14-16 in the flavor portion (10-22)
    const permission = nineumId.substring(14, 16);

    if (PERMISSION_HIERARCHY[permission]) {
      if (PERMISSION_HIERARCHY[permission].level > highestLevel) {
        highestLevel = PERMISSION_HIERARCHY[permission].level;
        highestPermission = permission;
      }
    }
  }

  if (!highestPermission) {
    return { success: false, error: 'No permission nineum found' };
  }

  const grantableLevel = PERMISSION_HIERARCHY[highestPermission].grants;
  if (!grantableLevel) {
    return {
      success: false,
      error: `${PERMISSION_HIERARCHY[highestPermission].name} permission cannot grant lower permissions`
    };
  }

  return {
    success: true,
    userPermission: highestPermission,
    userPermissionName: PERMISSION_HIERARCHY[highestPermission].name,
    grantableLevel,
    grantableName: PERMISSION_HIERARCHY[grantableLevel].name
  };
};

const resolve = async (req, res) => {
  try {
console.log('🪄 Fount resolving spell:', req.params.spellName);
    const spellName = req.params.spellName;
    const spell = req.body;

    // NEW: Check MP and Nineum permissions before processing creation spells
    const isCreationSpell = ['createProduct', 'createPost', 'createBDO', 'createVideo'].includes(spellName);

    if (isCreationSpell) {
      const permissionCheck = await checkMPAndNineumPermissions(spell.casterUUID, spellName, spell.totalCost);
      if (!permissionCheck.success) {
        console.log(`❌ Permission check failed (${permissionCheck.type}):`, permissionCheck.error);
        return res.status(900).send({
          success: false,
          error: permissionCheck.error,
          type: permissionCheck.type,
          required: permissionCheck.required,
          available: permissionCheck.available,
          details: permissionCheck.details
        });
      }
      console.log('✅ MP and nineum permission checks passed');
    }

    let resolved = true;

    const gatewayUsers = [];

    if(spell.gateways && spell.gateways.length > 0) {
      for(let i = 0; i < spell.gateways.length; i++) {
	const gateway = spell.gateways[i];

        if(gateway.signature.length < 5) {
          continue;
        }

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
console.log('🔍 DEBUG: spellName =', spellName);

      // 🌐 FORWARD SPELL TO DESTINATION SERVICES
      // Get spell definition from spellbook to find destinations
      const spellDefinition = spellbook[spellName];
      let serviceResponse = {};

      if (spellDefinition && spellDefinition.destinations) {
        console.log(`🌐 Forwarding spell to ${spellDefinition.destinations.length} destinations`);

        // Filter out fount as destination since we're already here
        const externalDestinations = spellDefinition.destinations.filter(d => d.stopName !== 'fount');

        // Forward to each destination (usually just one service)
        for (const destination of externalDestinations) {
          try {
            const destinationURL = `${destination.stopURL}${spellName}`;
            console.log(`  → Forwarding to ${destination.stopName}: ${destinationURL}`);

            const response = await fetch(destinationURL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(req.body)
            });

            if (response.ok) {
              const data = await response.json();
              console.log(`  ✅ Response from ${destination.stopName}:`, data);

              // Merge service response data
              serviceResponse = { ...serviceResponse, ...data };
            } else {
              console.log(`  ❌ Error from ${destination.stopName}: ${response.status}`);
              serviceResponse.error = `Service ${destination.stopName} returned ${response.status}`;
            }
          } catch (err) {
            console.log(`  ❌ Failed to reach ${destination.stopName}:`, err.message);
            serviceResponse.error = `Failed to reach ${destination.stopName}: ${err.message}`;
          }
        }
      }

      // Check if spell should give Galactic nineum on joinup
console.log('🔍 DEBUG: spellDefinition =', spellDefinition);
console.log('🔍 DEBUG: spellDefinition?.giveGalacticNineum =', spellDefinition?.giveGalacticNineum);
      if (spellDefinition?.giveGalacticNineum) {
        console.log('🔍 DEBUG: giveGalacticNineum block executing');
        // Only give Galactic nineum to the first 10 users (increased for testing)
        const currentGalacticCount = await db.countGalacticNineum();
        console.log(`💎 Galactic nineum count: ${currentGalacticCount}/10`);

        if (currentGalacticCount < 10) {
          console.log('  → Giving Galactic nineum to user on joinup');
          const galaxy = process.env.NINEUM_ADDRESS || '28880014';
          console.log(`  🔍 DEBUG: About to call constructGalacticNineum with galaxy: ${galaxy}`);
          const galacticNineum = await nineum.constructGalacticNineum(galaxy);
          console.log('  → Created Galactic nineum:', galacticNineum);
          console.log(`  🔍 DEBUG: Galactic nineum positions 14-15: ${galacticNineum.substring(14, 16)}`);

          // Save nineum using the proper db function
          const userNineum = await db.getNineum(caster);
          console.log(`  🔍 DEBUG: User nineum before save:`, userNineum);
          await db.saveNineum(caster, [galacticNineum]);
          console.log('  ✅ Galactic nineum added to user');

          // Verify it was saved
          const verifyNineum = await db.getNineum(caster);
          console.log(`  🔍 DEBUG: User nineum after save:`, verifyNineum);
        } else {
          console.log('  ⚠️  Maximum Galactic nineum (10) already distributed, skipping');
        }
      }

      // Handle grantNineum spell - allow users to grant next lower permission
      if (spellName === 'grantNineum') {
        console.log('🎁 Processing grantNineum spell');

        // Get recipient UUID from spell data
        const recipientUUID = req.body.recipientUUID;
        if (!recipientUUID) {
          console.log('❌ No recipient specified');
          return res.status(900).send({
            success: false,
            error: 'No recipient UUID specified'
          });
        }

        // Get caster's nineum and determine what they can grant
        const casterNineum = (await db.getNineum(caster)).nineum || [];
        const grantCheck = getGrantablePermission(casterNineum);

        if (!grantCheck.success) {
          console.log(`❌ Cannot grant: ${grantCheck.error}`);
          return res.status(900).send({
            success: false,
            error: grantCheck.error
          });
        }

        console.log(`✅ ${grantCheck.userPermissionName} user can grant ${grantCheck.grantableName} nineum`);

        // Get recipient user
        const recipient = await user.getUser(recipientUUID);
        if (!recipient) {
          console.log('❌ Recipient not found');
          return res.status(900).send({
            success: false,
            error: 'Recipient user not found'
          });
        }

        // Create the nineum based on permission level
        console.log(`🔧 DEBUG: About to create nineum. grantableLevel: ${grantCheck.grantableLevel}`);
        const galaxy = process.env.NINEUM_ADDRESS || '28880014';
        let grantedNineum;

        switch(grantCheck.grantableLevel) {
          case 'fe': // Constellation
            grantedNineum = await nineum.constructConstellationNineum(galaxy);
            break;
          case 'fd': // Scalar
            grantedNineum = await nineum.constructScalarNineum(galaxy);
            break;
          case 'fc': // Stellation
            grantedNineum = await nineum.constructStellationNineum(galaxy);
            break;
          case 'fb': // World
            grantedNineum = await nineum.constructWorldNineum(galaxy);
            break;
          default:
            console.log('❌ Unknown permission level');
            return res.status(900).send({
              success: false,
              error: 'Unknown permission level'
            });
        }

        console.log(`  → Created ${grantCheck.grantableName} nineum:`, grantedNineum);

        // Save nineum to recipient
        await db.saveNineum(recipient, [grantedNineum]);
        console.log(`  ✅ ${grantCheck.grantableName} nineum granted to ${recipientUUID}`);
      }

      // Handle addSpell - allow Stellation+ users to add spells to spellbook
      if (spellName === 'addSpell') {
        console.log('📜 Processing addSpell spell');

        // Check user has Stellation permission or higher
        const casterNineum = (await db.getNineum(caster)).nineum || [];

        if (!nineum.canWriteToSpellbook({ nineum: casterNineum })) {
          console.log('❌ Insufficient permission: requires Stellation or higher');
          return res.status(900).send({
            success: false,
            error: 'Insufficient permission: requires Stellation nineum or higher to write spells'
          });
        }

        // Get spell definition from request body
        const { spellName: newSpellName, spellDefinition: newSpellDefinition } = req.body;

        if (!newSpellName || !newSpellDefinition) {
          console.log('❌ Missing spell name or definition');
          return res.status(900).send({
            success: false,
            error: 'Missing spellName or spellDefinition in request'
          });
        }

        // Validate spell definition has required fields
        if (newSpellDefinition.cost === undefined || !newSpellDefinition.destinations || !newSpellDefinition.resolver) {
          console.log('❌ Invalid spell definition: missing required fields');
          return res.status(900).send({
            success: false,
            error: 'Spell definition must include cost, destinations, and resolver'
          });
        }

        console.log(`✅ User has Stellation permission, adding spell: ${newSpellName}`);

        // Read current spellbook
        const fs = await import('fs/promises');
        const path = await import('path');
        const { fileURLToPath } = await import('url');
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        const spellbookPath = path.join(__dirname, '../../spellbooks/spellbook.js');
        let spellbookContent = await fs.readFile(spellbookPath, 'utf-8');

        // Check if spell already exists
        const spellRegex = new RegExp(`${newSpellName}:\\s*{`, 'm');
        if (spellRegex.test(spellbookContent)) {
          console.log(`⚠️  Spell ${newSpellName} already exists`);
          return res.status(900).send({
            success: false,
            error: `Spell ${newSpellName} already exists in spellbook`
          });
        }

        // Format the new spell entry
        const spellEntry = `
  ${newSpellName}: ${JSON.stringify(newSpellDefinition, null, 4).replace(/\n/g, '\n  ')}`;

        // Insert before the closing brace
        const insertPosition = spellbookContent.lastIndexOf('};');
        if (insertPosition === -1) {
          console.log('❌ Could not find spellbook closing brace');
          return res.status(900).send({
            success: false,
            error: 'Invalid spellbook format'
          });
        }

        // Add comma after previous spell and insert new spell
        const beforeClosing = spellbookContent.substring(0, insertPosition);
        const afterClosing = spellbookContent.substring(insertPosition);

        spellbookContent = beforeClosing + ',' + spellEntry + '\n' + afterClosing;

        // Write back to spellbook
        await fs.writeFile(spellbookPath, spellbookContent, 'utf-8');

        console.log(`  ✅ Spell ${newSpellName} added to spellbook`);
        console.log(`  📝 Spellbook updated at ${spellbookPath}`);
      }

      // 🎓 GRANT EXPERIENCE FOR SUCCESSFUL SPELL RESOLUTION
      // Every successfully resolved spell grants experience equal to its cost
      if (spell.totalCost && spell.totalCost > 0) {
        const experienceGained = spell.totalCost; // 1:1 ratio with spell cost

        // Initialize experiencePool if it doesn't exist
        if (!caster.experiencePool) {
          caster.experiencePool = 0;
        }

        caster.experiencePool += experienceGained;
        await db.saveUser(caster);

        console.log(`🎓 Granted ${experienceGained} experience to ${caster.uuid} (total: ${caster.experiencePool})`);
      }

      // 💎 GRANT NINEUM FOR SUCCESSFUL SPELL RESOLUTION (CASTER)
      // Rate: 200 MP or $1 = 1 nineum
      // Fractional amounts handled as probability
      if (spell.totalCost && spell.totalCost > 0) {
        const NINEUM_RATE = 200; // 200 MP = 1 nineum
        const nineumAmount = spell.totalCost / NINEUM_RATE;

        // Get integer and fractional parts
        const guaranteedNineum = Math.floor(nineumAmount);
        const fractionalNineum = nineumAmount - guaranteedNineum;

        // Determine total nineum to grant
        let totalNineumToGrant = guaranteedNineum;

        // Handle fractional nineum as probability
        if (fractionalNineum > 0) {
          const roll = Math.random();
          if (roll < fractionalNineum) {
            totalNineumToGrant += 1;
            console.log(`💎 Probability roll: ${roll.toFixed(3)} < ${fractionalNineum.toFixed(3)} - granting bonus nineum!`);
          } else {
            console.log(`💎 Probability roll: ${roll.toFixed(3)} >= ${fractionalNineum.toFixed(3)} - no bonus nineum`);
          }
        }

        // Grant nineum if any should be granted
        if (totalNineumToGrant > 0) {
          const grantedNineum = [];

          for (let i = 0; i < totalNineumToGrant; i++) {
            const newNineum = await nineum.constructNineum();
            grantedNineum.push(newNineum);
            console.log(`  💎 Constructed nineum ${i + 1}/${totalNineumToGrant}: ${newNineum}`);
          }

          // Save all granted nineum to user
          await db.saveNineum(caster, grantedNineum);

          console.log(`💎 Granted ${totalNineumToGrant} nineum to ${caster.uuid} (${spell.totalCost} MP / ${NINEUM_RATE} = ${nineumAmount.toFixed(2)})`);
        } else {
          console.log(`💎 No nineum granted (${spell.totalCost} MP / ${NINEUM_RATE} = ${nineumAmount.toFixed(2)} - not enough for guaranteed nineum)`);
        }
      }

      // 🎓💎 GRANT REWARDS TO GATEWAY PARTICIPANTS
      // Gateway users receive 10% of caster's rewards for facilitating spell resolution
      if (gatewayUsers.length > 0 && spell.totalCost && spell.totalCost > 0) {
        const GATEWAY_REWARD_RATE = 0.10; // 10% of caster's rewards per gateway
        console.log(`\n🌉 Rewarding ${gatewayUsers.length} gateway participants at ${GATEWAY_REWARD_RATE * 100}% rate`);

        for (const gatewayUser of gatewayUsers) {
          // Grant experience to gateway user
          const gatewayExperience = Math.floor(spell.totalCost * GATEWAY_REWARD_RATE);

          if (gatewayExperience > 0) {
            if (!gatewayUser.experiencePool) {
              gatewayUser.experiencePool = 0;
            }
            gatewayUser.experiencePool += gatewayExperience;
            await db.saveUser(gatewayUser);
            console.log(`  🎓 Gateway ${gatewayUser.uuid}: +${gatewayExperience} experience (total: ${gatewayUser.experiencePool})`);
          }

          // Grant nineum to gateway user (with probability)
          const NINEUM_RATE = 200;
          const gatewayNineumAmount = (spell.totalCost * GATEWAY_REWARD_RATE) / NINEUM_RATE;
          const guaranteedGatewayNineum = Math.floor(gatewayNineumAmount);
          const fractionalGatewayNineum = gatewayNineumAmount - guaranteedGatewayNineum;

          let totalGatewayNineum = guaranteedGatewayNineum;

          // Handle fractional nineum as probability
          if (fractionalGatewayNineum > 0) {
            const roll = Math.random();
            if (roll < fractionalGatewayNineum) {
              totalGatewayNineum += 1;
              console.log(`  💎 Gateway probability roll: ${roll.toFixed(3)} < ${fractionalGatewayNineum.toFixed(3)} - bonus nineum!`);
            }
          }

          // Grant nineum if any should be granted
          if (totalGatewayNineum > 0) {
            const grantedGatewayNineum = [];

            for (let i = 0; i < totalGatewayNineum; i++) {
              const newNineum = await nineum.constructNineum();
              grantedGatewayNineum.push(newNineum);
            }

            await db.saveNineum(gatewayUser, grantedGatewayNineum);
            console.log(`  💎 Gateway ${gatewayUser.uuid}: +${totalGatewayNineum} nineum (${(spell.totalCost * GATEWAY_REWARD_RATE).toFixed(0)} MP / ${NINEUM_RATE})`);
          } else if (gatewayNineumAmount > 0) {
            console.log(`  💎 Gateway ${gatewayUser.uuid}: ${(gatewayNineumAmount * 100).toFixed(1)}% chance for nineum (didn't roll)`);
          }
        }
      }

      const signatureMap = {};

      // Merge service response with MAGIC metadata
      // If service returned an error, set success to false
      const success = !serviceResponse.error;

      return res.send({
	success,
	signatureMap,
	...serviceResponse  // Include all data from the destination service
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

