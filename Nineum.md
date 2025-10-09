Each piece of Nineum is represented by a 128-bit integer. This integer encodes a number of properties that are useful for developers to utilize to develop cool experiences using Nineum. They breakdown as follows:

One byte - Universe: This is the universe that the protocol lives in. Future universes are possible, but unexplored as of now.

Four bytes - Address: This is the address of the resource, many other addresses can live in the same universe as this dual-resource protocol. Future addresses will be for future resources.

One byte - Charge: This can be positive or negative. Other charges are possible as the protocol is explored.

One byte - Direction: This can be up, down, north, south, east, or west. Other directions are possible as the protocol is explored.

One byte - Rarity: This can be common, nine, uncommon, rare, epic, legendary, mythical, or special permission levels. Other rarities are possible as the protocol is explored.

**Special Permission Levels (Rarity Byte)**: Certain rarity values are reserved for permission-based nineum that grant administrative capabilities within an allyabase instance:

- **`ff` - Galactic Permission** (Highest): Full administrative control over the allyabase instance
- **`fe` - Constellation Permission**: High-level administrative capabilities
- **`fd` - Scalar Permission**: Mid-level administrative capabilities
- **`fc` - Stellation Permission**: Minimum level required for spellbook writing
- **`fb` - World Permission**: Basic administrative capabilities

The permission system uses byte position 14-16 (0-indexed) in the nineum string to determine the permission level. Users with Stellation permission or higher can modify spellbooks for their allyabase instance.

One byte - Size: This can be miniscule, tiny, small, medium, standard, big, large, huge. Other sizes are possible as the protocol is explored.

One byte - Texture: This can be soft, bumpy, satin, rough, gritty, metallic, plush, woolen. Other textures are possible as the protocol is explored.

One byte - Shape: This can be sphere, cylinder, tetrahedron, cube, octahedron, dodecahedron, cone, torus. Other shapes are possible as the protocol is eplored.

One byte - Year: This is the numbered year since protocol start (starts at 1)

Four bytes - Ordinal: This is the ordinal of the Nineum with this universe+address+flavor.

As you can see there are a number of useful properties to help developers develop fun experiences using Nineum. The number of unique possible flavors of Nineum is Charge*Direction*Rarity*Size*Texture*Shape = 2*6*7*8*8*8 = 43,008, which seems to be a good number for game developers wanting unique items. This number can grow (or shrink though that’s doubtful) over the lifetime of the protocol. 


