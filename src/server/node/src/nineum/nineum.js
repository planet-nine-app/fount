import db from '../persistence/db.js';
import dayjs from 'dayjs';
import crypto from 'crypto';

const systemStartTime = 1722399380889;

function roll() {
  return crypto.randomInt(0, 10000) / 10000;
};

const chargeSet = {
  positive: '01',
  negative: '02'
};

const directionSet = {
  north: '01',
  south: '02',
  east: '03',
  west: '04',
  up: '05',
  down: '06'
};

const raritySet = {
  common: '01',
  uncommon: '02',
  rare: '03',
  epic: '04',
  legendary: '05',
  mythical: '06',
  nine: '09'
};

const sizeSet = {
  miniscule: '01',
  tiny: '02',
  small: '03',
  medium: '04',
  standard: '05',
  big: '06',
  large: '07',
  huge: '08'
};

const textureSet = {
  soft: '01',
  bumpy: '02',
  satin: '03',
  rough: '04',
  gritty: '05',
  metalic: '06',
  plush: '07',
  woolen: '08'
};

const shapeSet = {
  sphere: '01',
  cylinder: '02',
  tetrahedron: '03',
  cube: '04',
  octahedron: '05',
  dodecahedron: '06',
  cone: '07',
  torus: '08'
};

function getRarity() { // This algorithm is inefficient. I set it up this way when I first built this because
                       // I got tired of having to recalculate all of the thresholds to maintain comparable
                       // distributions in the other rarities. The way this is set up, tweaking one value 
                       // will affect the other values proportionally without having to change them.
                       // Which from an algorithm standpoint is kind of cool I think, but again is inefficient.
  let keys = Object.keys(raritySet);
  let choice = crypto.randomInt(0, keys.length - 1);
  switch(keys[choice]) {
    case 'common': return raritySet.common;
    break;
    case 'nine': if(roll() > 0.1) {
      return raritySet.nine;
    } else {
      return getRarity();
    }
    case 'uncommon': if(roll() > 0.25) {
      return raritySet.uncommon;
    } else {
      return getRarity();
    }
    break;
    case 'rare': if(roll() > 0.45) {
      return raritySet.rare;
    } else {
      return getRarity();
    }
    break;
    case 'epic': if(roll() > 0.68) {
      return raritySet.epic;
    } else {
      return getRarity();
    }
    break;
    case 'legendary': if(roll() > 0.87) {
      return raritySet.legendary;
    } else {
      return getRarity();
    }
    break;
    case 'mythical': if(roll() > 0.97) {
      return raritySet.mythical;
    } else {
      return getRarity();
    }
    break;
  }
  return raritySet.common;
};

function getOneFromSet(set) {
  let keys = Object.keys(set);
  let choice = Math.floor(Math.random() * keys.length);
  return set[keys[choice]];
};

function zeroPad(str, places) {
  let startingLength = str.length;
  let maxPlaces = places - startingLength;
  for(var i = 0; i < maxPlaces; i++) {
    str = '0' + str;
  }
  return str;
};

const PERMISSION_LEVELS = {
  GALACTIC: 'ff',
  CONSTELLATION: 'fe',
  SCALAR: 'fd',
  STELLATION: 'fc',
  WORLD: 'fb'
};

const PERMISSION_HIERARCHY = {
  'ff': 5, // Galactic
  'fe': 4, // Constellation
  'fd': 3, // Scalar
  'fc': 2, // Stellation (minimum for spellbook writing)
  'fb': 1  // World
};

const PERMISSION_NAMES = {
  'ff': 'Galactic',
  'fe': 'Constellation',
  'fd': 'Scalar',
  'fc': 'Stellation',
  'fb': 'World'
};

const nineum = {
  /**
   * Get the permission level from a nineum string
   * @param {string} nineumString - The nineum identifier
   * @returns {string|null} The permission level code (ff, fe, fd, fc, fb) or null
   */
  getPermissionLevel: (nineumString) => {
    if (!nineumString || nineumString.length < 16) {
      return null;
    }
    const level = nineumString.slice(14, 16);
    return PERMISSION_HIERARCHY[level] ? level : null;
  },

  /**
   * Get the permission name from a nineum string
   * @param {string} nineumString - The nineum identifier
   * @returns {string|null} The permission name or null
   */
  getPermissionName: (nineumString) => {
    const level = nineum.getPermissionLevel(nineumString);
    return level ? PERMISSION_NAMES[level] : null;
  },

  /**
   * Check if a nineum has a specific permission level or higher
   * @param {string} nineumString - The nineum identifier
   * @param {string} requiredLevel - The required permission level code
   * @returns {boolean} True if nineum has required permission or higher
   */
  hasPermission: (nineumString, requiredLevel) => {
    const level = nineum.getPermissionLevel(nineumString);
    if (!level || !PERMISSION_HIERARCHY[requiredLevel]) {
      return false;
    }
    return PERMISSION_HIERARCHY[level] >= PERMISSION_HIERARCHY[requiredLevel];
  },

  /**
   * Get the highest permission level from a user's nineum collection
   * @param {object} user - The user object with nineum array
   * @returns {object} Object with level code, name, and hierarchy value
   */
  getHighestPermission: (user) => {
    if (!user || !user.nineum || !Array.isArray(user.nineum)) {
      return { level: null, name: null, hierarchy: 0 };
    }

    let highestLevel = null;
    let highestHierarchy = 0;

    for (const nineumString of user.nineum) {
      const level = nineum.getPermissionLevel(nineumString);
      if (level && PERMISSION_HIERARCHY[level] > highestHierarchy) {
        highestLevel = level;
        highestHierarchy = PERMISSION_HIERARCHY[level];
      }
    }

    return {
      level: highestLevel,
      name: highestLevel ? PERMISSION_NAMES[highestLevel] : null,
      hierarchy: highestHierarchy
    };
  },

  /**
   * Check if user can write to spellbooks (requires Stellation or higher)
   * @param {object} user - The user object with nineum array
   * @returns {boolean} True if user has Stellation permission or higher
   */
  canWriteToSpellbook: (user) => {
    const highest = nineum.getHighestPermission(user);
    return highest.hierarchy >= PERMISSION_HIERARCHY[PERMISSION_LEVELS.STELLATION];
  },

  transferNineum: async (sourceUser, destinationUser, nineumUniqueIds, price, currency) => {
    // Price and currency are ignored for now, but paid transfers will be coming

    const updatedUser = await db.transferNineum(sourceUser, destinationUser, nineumUniqueIds);
    return updatedUser;
  },

  constructNineum: async () => {
    const universe = '01';
    const galaxy = process.env.NINEUM_ADDRESS || '28880014'; // Open Source Force's galaxy as unknowingly chosed by Wick3d in #chat
    let flavor = '';
    let ordinal = '';

    const charge = getOneFromSet(chargeSet);
    const direction = getOneFromSet(directionSet);
    const rarity = getRarity();
    const size = getOneFromSet(sizeSet);
    const texture = getOneFromSet(textureSet);
    const shape = getOneFromSet(shapeSet);

    flavor = charge + direction + rarity + size + texture + shape;

    let yearDiff = dayjs().diff(dayjs(systemStartTime), 'years') + 1;
    const year = zeroPad('' + yearDiff, 2);

    const flavorCount = await db.countForFlavorOfNineum(flavor);
    ordinal = zeroPad((flavorCount + 1) + '', 8);

    return universe + galaxy + flavor + year + ordinal;
  },

  // Permission Levels (highest to lowest):
  // ff - Galactic (highest permission)
  // fe - Constellation
  // fd - Scalar
  // fc - Stellation (minimum for spellbook writing)
  // fb - World

  constructGalacticNineum: async (galaxy) => {
    const universe = '01';
    let flavor = '';
    let ordinal = '';

    const charge = getOneFromSet(chargeSet);
    const direction = getOneFromSet(directionSet);
    const rarity = 'ff'; // Galactic permission
    const size = getOneFromSet(sizeSet);
    const texture = getOneFromSet(textureSet);
    const shape = getOneFromSet(shapeSet);

    flavor = charge + direction + rarity + size + texture + shape;

    let yearDiff = dayjs().diff(dayjs(systemStartTime), 'years') + 1;
    const year = zeroPad('' + yearDiff, 2);

    const flavorCount = await db.countForFlavorOfNineum(flavor);
    ordinal = zeroPad((flavorCount + 1) + '', 8);

    return universe + galaxy + flavor + year + ordinal;
  },

  constructConstellationNineum: async (galaxy) => {
    const universe = '01';
    let flavor = '';
    let ordinal = '';

    const charge = getOneFromSet(chargeSet);
    const direction = getOneFromSet(directionSet);
    const rarity = 'fe'; // Constellation permission
    const size = getOneFromSet(sizeSet);
    const texture = getOneFromSet(textureSet);
    const shape = getOneFromSet(shapeSet);

    flavor = charge + direction + rarity + size + texture + shape;

    let yearDiff = dayjs().diff(dayjs(systemStartTime), 'years') + 1;
    const year = zeroPad('' + yearDiff, 2);

    const flavorCount = await db.countForFlavorOfNineum(flavor);
    ordinal = zeroPad((flavorCount + 1) + '', 8);

    return universe + galaxy + flavor + year + ordinal;
  },

  constructScalarNineum: async (galaxy) => {
    const universe = '01';
    let flavor = '';
    let ordinal = '';

    const charge = getOneFromSet(chargeSet);
    const direction = getOneFromSet(directionSet);
    const rarity = 'fd'; // Scalar permission
    const size = getOneFromSet(sizeSet);
    const texture = getOneFromSet(textureSet);
    const shape = getOneFromSet(shapeSet);

    flavor = charge + direction + rarity + size + texture + shape;

    let yearDiff = dayjs().diff(dayjs(systemStartTime), 'years') + 1;
    const year = zeroPad('' + yearDiff, 2);

    const flavorCount = await db.countForFlavorOfNineum(flavor);
    ordinal = zeroPad((flavorCount + 1) + '', 8);

    return universe + galaxy + flavor + year + ordinal;
  },

  constructStellationNineum: async (galaxy) => {
    const universe = '01';
    let flavor = '';
    let ordinal = '';

    const charge = getOneFromSet(chargeSet);
    const direction = getOneFromSet(directionSet);
    const rarity = 'fc'; // Stellation permission (minimum for spellbook writing)
    const size = getOneFromSet(sizeSet);
    const texture = getOneFromSet(textureSet);
    const shape = getOneFromSet(shapeSet);

    flavor = charge + direction + rarity + size + texture + shape;

    let yearDiff = dayjs().diff(dayjs(systemStartTime), 'years') + 1;
    const year = zeroPad('' + yearDiff, 2);

    const flavorCount = await db.countForFlavorOfNineum(flavor);
    ordinal = zeroPad((flavorCount + 1) + '', 8);

    return universe + galaxy + flavor + year + ordinal;
  },

  constructWorldNineum: async (galaxy) => {
    const universe = '01';
    let flavor = '';
    let ordinal = '';

    const charge = getOneFromSet(chargeSet);
    const direction = getOneFromSet(directionSet);
    const rarity = 'fb'; // World permission
    const size = getOneFromSet(sizeSet);
    const texture = getOneFromSet(textureSet);
    const shape = getOneFromSet(shapeSet);

    flavor = charge + direction + rarity + size + texture + shape;

    let yearDiff = dayjs().diff(dayjs(systemStartTime), 'years') + 1;
    const year = zeroPad('' + yearDiff, 2);

    const flavorCount = await db.countForFlavorOfNineum(flavor);
    ordinal = zeroPad((flavorCount + 1) + '', 8);

    return universe + galaxy + flavor + year + ordinal;
  },

  // Legacy alias for backward compatibility
  constructAdministrativeNineum: async (galaxy) => {
    return nineum.constructConstellationNineum(galaxy);
  },

  constructSpecificFlavorNineum: async (_galaxy, _charge, _direction, _rarity, _size, _texture, _shape, quantity) => {
    const universe = '01';
    const galaxy = _galaxy || '28880014'; // Open Source Force's galaxy as unknowingly chosed by Wick3d in #chat
    let flavor = '';
    let ordinal = '';
  
    const charge = _charge || getOneFromSet(chargeSet);
    const direction = _direction || getOneFromSet(directionSet);
    const rarity = _rarity || getRarity();
    const size = _size || getOneFromSet(sizeSet);
    const texture = _texture || getOneFromSet(textureSet);
    const shape = _shape || getOneFromSet(shapeSet);
  
    flavor = charge + direction + rarity + size + texture + shape;
  
    let yearDiff = dayjs().diff(dayjs(systemStartTime), 'years') + 1;
    const year = zeroPad('' + yearDiff, 2);

    const flavorCount = await db.countForFlavorOfNineum(flavor);
//    ordinal = zeroPad((flavorCount + 1) + '', 8);

    let constructed = [];
    for(var i = 0; i < quantity; i++) {
      constructed.push(universe + galaxy + flavor + year + zeroPad(flavorCount + i + 1));
    }

    return constructed;
  },

  // Check if user has Stellation permission or higher (fc, fd, fe, ff)
  canWriteToSpellbook: (user) => {
    const nineumList = user.nineum || [];

    for (const nineumId of nineumList) {
      if (nineumId.length !== 32) continue;

      // Permission is at positions 14-16 (within flavor 10-22, rarity is at 4-6 of flavor)
      const permission = nineumId.substring(14, 16);

      // Stellation (fc) or higher permissions: fc, fd, fe, ff
      if (['fc', 'fd', 'fe', 'ff'].includes(permission)) {
        return true;
      }
    }

    return false;
  }
};

export default nineum;
