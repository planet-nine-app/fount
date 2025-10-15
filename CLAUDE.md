# Fount - Planet Nine MAGIC Protocol Resolver

## Overview

Fount is the central MAGIC protocol resolver for the Planet Nine ecosystem. It handles spell casting, authentication, experience granting, nineum distribution, and coordinates all inter-service communication.

**Location**: `/fount/`
**Port**: 3006 (default)

## Core Features

### 🎯 **MAGIC Protocol**
- **Spell Resolution**: Routes and resolves MAGIC spells across services
- **Centralized Authentication**: Validates all spell caster signatures
- **Experience Granting**: Automatic 1:1 experience with MP cost
- **Gateway Rewards**: 10% reward distribution to gateway participants
- **Nineum System**: Permission NFTs with galaxies and attributes

### 🔐 **User Management**
- **User Creation**: Register users with cryptographic keys
- **User Retrieval**: Lookup by UUID or public key
- **User Deletion**: Remove users from system

### 💎 **Nineum Operations**
- **Galactic Nineum**: Claim galaxy ownership (permission level ff)
- **Admin Nineum**: Grant admin permissions (permission level fe)
- **Flavored Nineum**: Create nineum with specific attributes
- **Nineum Transfer**: Transfer nineum between users
- **Experience Grants**: Grant experience to users

## API Endpoints

### User Operations
- `PUT /user/create` - Create new user
- `GET /user/:uuid` - Get user by UUID
- `GET /user/pubKey/:pubKey` - Get user by public key
- `DELETE /user/:uuid` - Delete user

### Nineum Operations
- `PUT /user/:uuid/nineum/galactic` - Claim galactic nineum
- `PUT /user/:uuid/nineum/admin` - Grant admin nineum
- `PUT /user/:uuid/nineum` - Grant flavored nineum
- `POST /user/:uuid/transfer` - Transfer nineum
- `POST /user/:uuid/grant` - Grant experience
- `GET /user/:uuid/nineum` - Get user's nineum

### MAGIC Protocol
- `POST /resolve/:spellName` - Resolve MAGIC spell (primary endpoint)
- `POST /magic/spell/:spellName` - Execute Fount internal operations via MAGIC

### Health & Status
- `GET /health` - Service health check

## MAGIC Route Conversion (October 2025)

All Fount internal operations have been converted to MAGIC protocol spells using a self-resolution pattern:

### Converted Spells (7 total)
1. **fountUserCreate** - Create fount user
2. **fountUserNineumGalactic** - Claim galactic nineum (galaxy ownership)
3. **fountUserNineumAdmin** - Grant admin nineum (admin permissions)
4. **fountUserNineum** - Grant flavored nineum with specific attributes
5. **fountUserTransfer** - Transfer nineum between users
6. **fountUserGrant** - Grant experience to users
7. **fountUserDelete** - Delete fount user

**Testing**: Comprehensive MAGIC spell tests available in `/test/mocha/magic-spells.js` (10 tests covering success and error cases)

**Documentation**: See `/MAGIC-ROUTES.md` for complete spell specifications, nineum system documentation, and migration guide

## Self-Resolution Pattern

Fount implements a unique self-resolution pattern for its internal operations:

1. Client casts spell to Fount's `/resolve/` endpoint
2. Fount routes to `/magic/spell/:spellName` internally
3. MAGIC handler executes operation
4. Result returned to `/resolve/` endpoint
5. Standard MAGIC processing (experience, nineum probability, gateway rewards)

This pattern allows Fount's internal operations to benefit from the same MAGIC protocol features as other services.

## Nineum System

**Permission Levels**:
- `ff` - Galactic: Galaxy ownership, can grant any nineum in their galaxy
- `fe` - Admin: Can grant any nineum
- `00` - Normal: Regular nineum with specific flavors

**Flavor Format** (12 hex characters):
- Bytes 0-1: Charge (01=positive, 02=negative, etc.)
- Bytes 2-3: Direction (01=north, 02=south, etc.)
- Bytes 4-5: Rarity (01=common, 02=uncommon, etc.)
- Bytes 6-7: Size (01=tiny, 02=small, etc.)
- Bytes 8-9: Texture (01=satin, 02=velvet, etc.)
- Bytes 10-11: Shape (01=sphere, 02=cube, etc.)

**Galaxy Format**: 8-character hex string identifying galaxy

## Implementation Details

**MAGIC Handler**: `/src/server/node/src/magic/magic.js`

**Spellbook**: `/src/server/node/spellbooks/spellbook.js` - Central registry of all Planet Nine MAGIC spells

**Key Features**:
- Dynamic module imports to avoid circular dependencies
- Permission checking for nineum operations
- Automatic nineum probability (200 MP = 1 nineum)
- Gateway reward distribution (10% of experience)

## Last Updated
October 14, 2025 - Completed full MAGIC protocol conversion. All 7 internal routes now accessible via MAGIC spells with self-resolution pattern. Fount remains the central resolver for all Planet Nine MAGIC spells.
