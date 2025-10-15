# Fount MAGIC-Routed Endpoints

## Overview

Fount now supports MAGIC-routed versions of its internal POST, PUT, and DELETE operations. These spells route through Fount itself (self-resolution) for centralized authentication. Fount is the central MAGIC resolver and authentication service for the Planet Nine ecosystem, managing user accounts, experience/MP, and nineum (permission NFTs).

**Note**: The `/resolve/:spellName` endpoint is NOT converted to a MAGIC spell, as it is the spell resolver itself.

## Converted Routes

### 1. Create User
**Direct Route**: `PUT /user/create`
**MAGIC Spell**: `fountUserCreate`
**Cost**: 50 MP

**Components**:
```javascript
{
  pubKey: "user-public-key",
  user: { // Optional - additional user data
    // ... custom user fields
  }
}
```

**Returns**:
```javascript
{
  uuid: "user-uuid",
  pubKey: "user-public-key",
  experience: 0,
  nineum: [],
  // ... other user fields
}
```

**Validation**:
- Requires pubKey
- If user already exists, returns existing user
- Creates new user with UUID and default fields

---

### 2. Grant Nineum
**Direct Route**: `PUT /user/:uuid/nineum`
**MAGIC Spell**: `fountUserNineum`
**Cost**: 50 MP

**Components**:
```javascript
{
  uuid: "granter-uuid", // Must have galactic or admin nineum
  toUserUUID: "recipient-uuid",
  charge: "01", // 01=positive, 02=negative
  direction: "01", // 01=north, 02=south, 03=east, 04=west
  rarity: "01", // 01=common, 02=uncommon, 03=rare, 04=epic, 05=legendary
  size: "01", // 01=tiny, 02=small, 03=medium, 04=large, 05=huge
  texture: "01", // 01=satin, 02=bumpy, 03=gritty, 04=crystalline, 05=ethereal
  shape: "01", // 01=sphere, 02=cylinder, 03=cube, 04=pyramid, 05=torus, 06=irregular
  quantity: 3 // Number of nineum to grant
}
```

**Returns**:
```javascript
{
  uuid: "recipient-uuid",
  pubKey: "recipient-public-key",
  experience: 100,
  nineum: [
    "0x01010101010101...", // Array of granted nineum
    // ...
  ]
}
```

**Validation**:
- Requires all flavor components (charge, direction, rarity, size, texture, shape, quantity)
- Granter must have galactic (ff) or administrative (fe) nineum
- Recipient user must exist
- Nineum flavor constructed from galaxy + attributes

**Nineum Flavor Format**:
```
Structure: 0xGGGGGGGGCDRSTSHPP
  GGGGGGGG = Galaxy ID (8 hex chars)
  C = Charge (01-02)
  D = Direction (01-04)
  R = Rarity (01-05)
  S = Size (01-05)
  T = Texture (01-05)
  SH = Shape (01-06)
  PP = Permission level (00=normal, fe=admin, ff=galactic)
```

---

### 3. Grant Admin Nineum
**Direct Route**: `PUT /user/:uuid/nineum/admin`
**MAGIC Spell**: `fountUserNineumAdmin`
**Cost**: 50 MP

**Components**:
```javascript
{
  uuid: "granter-uuid", // Must have galactic nineum
  toUserUUID: "recipient-uuid"
}
```

**Returns**:
```javascript
{
  uuid: "recipient-uuid",
  pubKey: "recipient-public-key",
  nineum: [
    "0x...fe", // Administrative nineum (ends with 'fe')
    // ...
  ]
}
```

**Validation**:
- Requires uuid and toUserUUID
- Granter must have galactic nineum (ff)
- Recipient user must exist
- Grants administrative nineum for the galaxy

---

### 4. Claim Galactic Nineum
**Direct Route**: `PUT /user/:uuid/nineum/galactic`
**MAGIC Spell**: `fountUserNineumGalactic`
**Cost**: 50 MP

**Components**:
```javascript
{
  uuid: "user-uuid",
  galaxy: "12345678" // 8-character hex galaxy ID
}
```

**Returns**:
```javascript
{
  uuid: "user-uuid",
  pubKey: "user-public-key",
  nineum: [
    "0x12345678...ff", // Galactic nineum (ends with 'ff')
    // ...
  ]
}
```

**Validation**:
- Requires uuid and galaxy
- Galaxy must not be already claimed
- Galaxy ID must be 8-character hex string
- First user to claim a galaxy gets galactic permission for it

**Galaxy Ownership**:
- Each galaxy can only be claimed once
- Galactic nineum (ff) grants full control over galaxy
- Can grant administrative nineum (fe) to others
- Can grant any flavored nineum within galaxy

---

### 5. Delete User
**Direct Route**: `DELETE /user/:uuid`
**MAGIC Spell**: `fountUserDelete`
**Cost**: 50 MP

**Components**:
```javascript
{
  uuid: "user-uuid"
}
```

**Returns**:
```javascript
{
  success: true
}
```

**Validation**:
- Requires uuid
- User must exist
- Deletes all user data including experience, nineum, and account info

---

### 6. Transfer Nineum
**Direct Route**: `POST /user/:uuid/transfer`
**MAGIC Spell**: `fountUserTransfer`
**Cost**: 50 MP

**Components**:
```javascript
{
  uuid: "source-uuid",
  destinationUUID: "destination-uuid",
  nineumUniqueIds: [
    "0x01010101010101...",
    "0x02020202020202..."
  ], // Array of specific nineum IDs to transfer
  price: 0, // Optional - price for transfer (0 for free)
  currency: "usd" // Optional - currency for price
}
```

**Returns**:
```javascript
{
  uuid: "source-uuid",
  pubKey: "source-public-key",
  nineum: [
    // Updated nineum array (transferred nineum removed)
  ]
}
```

**Validation**:
- Requires uuid, destinationUUID, and nineumUniqueIds
- Source user must own the specified nineum
- Destination user must exist
- Price > 0 is not yet implemented
- Nineum transferred from source to destination

---

### 7. Grant Experience
**Direct Route**: `POST /user/:uuid/grant`
**MAGIC Spell**: `fountUserGrant`
**Cost**: 50 MP

**Components**:
```javascript
{
  uuid: "granter-uuid",
  destinationUUID: "recipient-uuid",
  amount: 100, // Amount of experience/MP to grant
  description: "Reward for completing quest" // Optional
}
```

**Returns**:
```javascript
{
  uuid: "recipient-uuid",
  pubKey: "recipient-public-key",
  experience: 200, // Updated experience total
  // ...
}
```

**Validation**:
- Requires uuid, destinationUUID, and amount
- Source user must exist
- Destination user must exist
- Experience/MP granted from source to destination

---

## Implementation Details

### File Changes

1. **`/src/server/node/src/magic/magic.js`** - Created with seven spell handlers:
   - `fountUserCreate(spell)`
   - `fountUserNineum(spell)`
   - `fountUserNineumAdmin(spell)`
   - `fountUserNineumGalactic(spell)`
   - `fountUserDelete(spell)`
   - `fountUserTransfer(spell)`
   - `fountUserGrant(spell)`

2. **`/src/server/node/fount.js`** - Added MAGIC spell endpoint and import

3. **`/src/server/node/spellbooks/spellbook.js`** - Added spell definitions with self-routing

4. **`/test/mocha/magic-spells.js`** - New test file with comprehensive spell tests

5. **`/test/mocha/package.json`** - Added `fount-js` dependency

### Authentication Flow

```
Client → Fount (resolver) → Fount MAGIC handler → Business logic
           ↓
    Verifies signature
    Deducts MP
    Grants experience
    Grants nineum
```

**Self-Resolution Pattern**:
- Fount spells route through Fount itself
- First stop: `/magic/spell/:spellName` (business logic)
- Second stop: `/resolve/:spellName` (authentication & rewards)
- Authentication happens after business logic for internal operations

### Naming Convention

Route path → Spell name transformation:
```
/user/create                    → fountUserCreate
/user/:uuid/nineum              → fountUserNineum
/user/:uuid/nineum/admin        → fountUserNineumAdmin
/user/:uuid/nineum/galactic     → fountUserNineumGalactic
/user/:uuid                     → fountUserDelete
/user/:uuid/transfer            → fountUserTransfer
/user/:uuid/grant               → fountUserGrant
```

Pattern: `[service][PathWithoutSlashesAndParams]`

### Dynamic Module Imports

Fount uses dynamic imports to avoid circular dependencies:

```javascript
// In magic.js spell handlers
const userModule = await import('../user/user.js');
const user = userModule.default;

const dbModule = await import('../persistence/db.js');
const db = dbModule.default;
```

### Error Handling

All spell handlers return consistent error format:
```javascript
{
  success: false,
  error: "Error description"
}
```

**Common Errors**:
- Missing required fields
- User not found
- Insufficient permissions (for nineum operations)
- Galaxy already claimed
- Paid transfers not implemented

## Testing

Run MAGIC spell tests:
```bash
cd fount/test/mocha
npm install
npm test magic-spells.js
```

Test coverage:
- ✅ User creation via spell
- ✅ Galactic nineum claiming via spell
- ✅ Admin nineum granting via spell
- ✅ Flavored nineum granting via spell
- ✅ Nineum transfer via spell
- ✅ Experience grant via spell
- ✅ User deletion via spell
- ✅ Missing pubKey validation
- ✅ Duplicate galaxy claim (error case)
- ✅ Missing nineum flavor components validation

## Benefits

1. **Self-Resolution**: Fount routes its own operations through MAGIC system
2. **Consistent Pattern**: Same authentication flow as other services
3. **Automatic Rewards**: Internal operations grant experience + nineum
4. **Gateway Rewards**: Gateway participants benefit from Fount operations
5. **Centralized Auth**: All Fount operations verified through resolver
6. **Simplified Code**: Business logic separated from authentication

## Fount's Role in Planet Nine

Fount is the **central MAGIC resolver and authentication service** that provides:

### MAGIC Resolution
- Spell signature verification
- MP deduction and balance management
- Experience granting (1:1 with MP cost)
- Nineum probability grants (200 MP = 1 nineum)
- Gateway reward distribution

### User Account Management
- User creation and UUID generation
- Public key to UUID mapping
- User deletion and cleanup
- Experience/MP tracking

### Nineum Management (Permission NFTs)
- Galaxy claiming and ownership
- Galactic nineum (ff) - full galaxy control
- Administrative nineum (fe) - galaxy admin permissions
- Flavored nineum - specific permissions with attributes
- Nineum transfer between users
- Nineum granting with permission checks

### Experience & MP System
- Experience as Magic Points (MP)
- Experience grants between users
- MP consumption for spell casting
- Experience gained through spell casting
- Balance tracking and validation

### Integration Points
- **All Services**: Resolves spells from all Planet Nine services
- **BDO**: Creates BDO user for spellbook storage
- **Addie**: Payment processing integration
- **Gateway System**: Manages gateway rewards and participation

## Nineum System

### What is Nineum?

Nineum are cryptographic permission NFTs in the Planet Nine ecosystem. Each nineum represents specific permissions with attributes:

**Attributes**:
- **Charge**: Positive or negative
- **Direction**: North, south, east, west
- **Rarity**: Common to legendary
- **Size**: Tiny to huge
- **Texture**: Satin to ethereal
- **Shape**: Sphere, cylinder, cube, etc.

**Permission Levels**:
- **00**: Normal nineum with attribute-based permissions
- **fe**: Administrative nineum - galaxy admin
- **ff**: Galactic nineum - galaxy owner

### Galaxy System

**Galaxies** are permission domains in Planet Nine:
- Each galaxy has unique 8-character hex ID
- First user to claim a galaxy gets galactic nineum (ff)
- Galaxy owner can grant admin nineum (fe) to others
- Admins can grant flavored nineum within galaxy
- Nineum permissions are scoped to galaxy

### Use Cases

**Galactic Nineum (ff)**:
- Create and manage galaxy
- Grant administrative permissions
- Full control over galaxy resources
- Create any flavored nineum within galaxy

**Administrative Nineum (fe)**:
- Manage galaxy resources
- Grant flavored nineum to users
- Moderate galaxy content
- Administrative operations

**Flavored Nineum (00)**:
- Access specific features
- Create content with attributes
- Participate in galaxy activities
- Permission-gated operations

## Next Steps

Progress on MAGIC route conversion:
- ✅ Joan (3 routes complete)
- ✅ Pref (4 routes complete)
- ✅ Aretha (4 routes complete)
- ✅ Continuebee (3 routes complete)
- ✅ BDO (4 routes complete)
- ✅ Julia (8 routes complete)
- ✅ Dolores (8 routes complete)
- ✅ Sanora (6 routes complete)
- ✅ Addie (9 routes complete)
- ✅ Covenant (5 routes complete)
- ✅ Prof (3 routes complete)
- ✅ Fount (7 routes complete)
- ⏳ Minnie (SMTP only, no HTTP routes to convert)

## Last Updated
January 14, 2025
