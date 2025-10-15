
const SUBDOMAIN = process.env.SUBDOMAIN || 'dev';

export default {
  spellbookName: 'allyabase',
  spellTest: {
    cost: 400,
    destinations: [
	{
	    stopName: 'test-server',
	    stopURL: 'http://127.0.0.1:3456/magic/spell/'
	},
	{
	    stopName: 'fount',
	    stopURL: 'http://127.0.0.1:5117/resolve/'
	}
    ],
    resolver: 'fount',
    mp: true
  },
  joinup: {
    cost: 400,
    destinations: [
      {stopName: 'julia', stopURL: process.env.LOCALHOST ? 'http://localhost:3000/magic/spell/' : `https://${SUBDOMAIN}.julia.allyabase.com/magic/spell/`},
      {stopName: 'continuebee', stopURL: process.env.LOCALHOST ? 'http://localhost:2999/magic/spell/' : `https://${SUBDOMAIN}.continuebee.allyabase.com/magic/spell/`},
      {stopName: 'pref', stopURL: process.env.LOCALHOST ? 'http://localhost:3002/magic/spell/' : `https://${SUBDOMAIN}.pref.allyabase.com/magic/spell/`},
      {stopName: 'bdo', stopURL: process.env.LOCALHOST ? 'http://localhost:3003/magic/spell/' : `https://${SUBDOMAIN}.bdo.allyabase.com/magic/spell/`},
      {stopName: 'joan', stopURL: process.env.LOCALHOST ? 'http://localhost:3004/magic/spell/' : `https://${SUBDOMAIN}.joan.allyabase.com/magic/spell/`},
      {stopName: 'addie', stopURL: process.env.LOCALHOST ? 'http://localhost:3005/magic/spell/' : `https://${SUBDOMAIN}.addie.allyabase.com/magic/spell/`},
      {stopName: 'aretha', stopURL: process.env.LOCALHOST ? 'http://localhost:3007/magic/spell/' : `https://${SUBDOMAIN}.aretha.allyabase.com/magic/spell/`},
      {stopName: 'dolores', stopURL: process.env.LOCALHOST ? 'http://localhost:3004/magic/spell/' : `https://${SUBDOMAIN}.dolores.allyabase.com/magic/spell/`},
      {stopName: 'sanora', stopURL: process.env.LOCALHOST ? 'http://localhost:7243/magic/spell/' : `https://${SUBDOMAIN}.sanora.allyabase.com/magic/spell/`},
      {stopName: 'minnie', stopURL: process.env.LOCALHOST ? 'http://localhost:3011/magic/spell/' : `https://${SUBDOMAIN}.minnie.allyabase.com/magic/spell/`},
      {stopName: 'covenant', stopURL: process.env.LOCALHOST ? 'http://localhost:7277/magic/spell/' : `https://${SUBDOMAIN}.covenant.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    giveGalacticNineum: true
  },

  linkup: {
    cost: 400,
    destinations: [
      {stopName: 'joan', stopURL: process.env.LOCALHOST ? 'http://localhost:3004/magic/spell/' : `https://${SUBDOMAIN}.joan.allyabase.com/magic/spell/`},
      {stopName: 'bdo', stopURL: process.env.LOCALHOST ? 'http://localhost:3003/magic/spell/' : `https://${SUBDOMAIN}.bdo.allyabase.com/magic/spell/`},
      {stopName: 'pref', stopURL: process.env.LOCALHOST ? 'http://localhost:3002/magic/spell/' : `https://${SUBDOMAIN}.pref.allyabase.com/magic/spell/`},
      {stopName: 'addie', stopURL: process.env.LOCALHOST ? 'http://localhost:3005/magic/spell/' : `https://${SUBDOMAIN}.addie.allyabase.com/magic/spell/`},
      {stopName: 'julia', stopURL: process.env.LOCALHOST ? 'http://localhost:3000/magic/spell/' : `https://${SUBDOMAIN}.julia.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount'
  },

  // Creation operation spells - require MP and nineum permissions
  createProduct: {
    cost: 200, // MP cost
    destinations: [
      {stopName: 'julia', stopURL: process.env.LOCALHOST ? 'http://localhost:3007/magic/spell/' : `https://${SUBDOMAIN}.julia.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`},
      {stopName: 'sanora', stopURL: process.env.LOCALHOST ? 'http://localhost:7243/magic/spell/' : `https://${SUBDOMAIN}.sanora.allyabase.com/magic/spell/`}
    ],
    resolver: 'fount',
    mp: true,
    requiredNineum: {
      galaxy: '01', // Default galaxy for creation operations
      system: '28880014', // Default system (was "galaxy" in old terminology)
      flavor: '010103040101' // Example: positive+north+rare+medium+soft+sphere for product creation
    }
  },

  createPost: {
    cost: 100, // MP cost
    destinations: [
      {stopName: 'julia', stopURL: process.env.LOCALHOST ? 'http://localhost:3007/magic/spell/' : `https://${SUBDOMAIN}.julia.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`},
      {stopName: 'dolores', stopURL: process.env.LOCALHOST ? 'http://localhost:3004/magic/spell/' : `https://${SUBDOMAIN}.dolores.allyabase.com/magic/spell/`}
    ],
    resolver: 'fount',
    mp: true,
    requiredNineum: {
      galaxy: '01',
      system: '28880014',
      flavor: '010102030201' // Example: positive+north+uncommon+small+bumpy+cylinder for posts
    }
  },

  createBDO: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'julia', stopURL: process.env.LOCALHOST ? 'http://localhost:3007/magic/spell/' : `https://${SUBDOMAIN}.julia.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`},
      {stopName: 'bdo', stopURL: process.env.LOCALHOST ? 'http://localhost:3003/magic/spell/' : `https://${SUBDOMAIN}.bdo.allyabase.com/magic/spell/`}
    ],
    resolver: 'fount',
    mp: true,
    requiredNineum: {
      galaxy: '01',
      system: '28880014',
      flavor: '010101020301' // Example: positive+north+common+tiny+satin+sphere for BDO creation
    }
  },

  createVideo: {
    cost: 150, // MP cost
    destinations: [
      {stopName: 'julia', stopURL: process.env.LOCALHOST ? 'http://localhost:3007/magic/spell/' : `https://${SUBDOMAIN}.julia.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`},
      {stopName: 'dolores', stopURL: process.env.LOCALHOST ? 'http://localhost:3004/magic/spell/' : `https://${SUBDOMAIN}.dolores.allyabase.com/magic/spell/`}
    ],
    resolver: 'fount',
    mp: true,
    requiredNineum: {
      galaxy: '01',
      system: '28880014',
      flavor: '010104050401' // Example: positive+north+epic+standard+gritty+cube for video creation
    }
  },

  // Permission granting spell
  grantNineum: {
    cost: 100, // MP cost
    destinations: [
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  // Spell writing spell - requires Stellation permission or higher
  addSpell: {
    cost: 200, // MP cost
    destinations: [
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true,
    requiresStellation: true // Flag to check for minimum Stellation permission
  },

  // Joan MAGIC-routed operations
  joanUserCreate: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'joan', stopURL: process.env.LOCALHOST ? 'http://localhost:3004/magic/spell/' : `https://${SUBDOMAIN}.joan.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  joanUserUpdateHash: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'joan', stopURL: process.env.LOCALHOST ? 'http://localhost:3004/magic/spell/' : `https://${SUBDOMAIN}.joan.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  joanUserDelete: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'joan', stopURL: process.env.LOCALHOST ? 'http://localhost:3004/magic/spell/' : `https://${SUBDOMAIN}.joan.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  // Pref MAGIC-routed operations
  prefUserCreate: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'pref', stopURL: process.env.LOCALHOST ? 'http://localhost:3002/magic/spell/' : `https://${SUBDOMAIN}.pref.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  prefUserPreferences: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'pref', stopURL: process.env.LOCALHOST ? 'http://localhost:3002/magic/spell/' : `https://${SUBDOMAIN}.pref.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  prefUserGlobalPreferences: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'pref', stopURL: process.env.LOCALHOST ? 'http://localhost:3002/magic/spell/' : `https://${SUBDOMAIN}.pref.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  prefUserDelete: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'pref', stopURL: process.env.LOCALHOST ? 'http://localhost:3002/magic/spell/' : `https://${SUBDOMAIN}.pref.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  // Aretha MAGIC-routed operations
  arethaUserCreate: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'aretha', stopURL: process.env.LOCALHOST ? 'http://localhost:7277/magic/spell/' : `https://${SUBDOMAIN}.aretha.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  arethaUserTickets: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'aretha', stopURL: process.env.LOCALHOST ? 'http://localhost:7277/magic/spell/' : `https://${SUBDOMAIN}.aretha.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  arethaUserGrant: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'aretha', stopURL: process.env.LOCALHOST ? 'http://localhost:7277/magic/spell/' : `https://${SUBDOMAIN}.aretha.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  arethaUserGalaxy: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'aretha', stopURL: process.env.LOCALHOST ? 'http://localhost:7277/magic/spell/' : `https://${SUBDOMAIN}.aretha.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  // Continuebee MAGIC-routed operations
  continuebeeUserCreate: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'continuebee', stopURL: process.env.LOCALHOST ? 'http://localhost:2999/magic/spell/' : `https://${SUBDOMAIN}.continuebee.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  continuebeeUserUpdateHash: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'continuebee', stopURL: process.env.LOCALHOST ? 'http://localhost:2999/magic/spell/' : `https://${SUBDOMAIN}.continuebee.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  continuebeeUserDelete: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'continuebee', stopURL: process.env.LOCALHOST ? 'http://localhost:2999/magic/spell/' : `https://${SUBDOMAIN}.continuebee.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  // BDO MAGIC-routed operations
  bdoUserCreate: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'bdo', stopURL: process.env.LOCALHOST ? 'http://localhost:3003/magic/spell/' : `https://${SUBDOMAIN}.bdo.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  bdoUserBdo: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'bdo', stopURL: process.env.LOCALHOST ? 'http://localhost:3003/magic/spell/' : `https://${SUBDOMAIN}.bdo.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  bdoUserBases: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'bdo', stopURL: process.env.LOCALHOST ? 'http://localhost:3003/magic/spell/' : `https://${SUBDOMAIN}.bdo.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  bdoUserSpellbooks: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'bdo', stopURL: process.env.LOCALHOST ? 'http://localhost:3003/magic/spell/' : `https://${SUBDOMAIN}.bdo.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  // Julia MAGIC-routed operations
  juliaUserCreate: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'julia', stopURL: process.env.LOCALHOST ? 'http://localhost:3000/magic/spell/' : `https://${SUBDOMAIN}.julia.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  juliaUserAssociateSignedPrompt: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'julia', stopURL: process.env.LOCALHOST ? 'http://localhost:3000/magic/spell/' : `https://${SUBDOMAIN}.julia.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  juliaUserAssociate: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'julia', stopURL: process.env.LOCALHOST ? 'http://localhost:3000/magic/spell/' : `https://${SUBDOMAIN}.julia.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  juliaAssociatedUserDelete: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'julia', stopURL: process.env.LOCALHOST ? 'http://localhost:3000/magic/spell/' : `https://${SUBDOMAIN}.julia.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  juliaUserDelete: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'julia', stopURL: process.env.LOCALHOST ? 'http://localhost:3000/magic/spell/' : `https://${SUBDOMAIN}.julia.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  juliaMessage: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'julia', stopURL: process.env.LOCALHOST ? 'http://localhost:3000/magic/spell/' : `https://${SUBDOMAIN}.julia.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  juliaUserCoordinate: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'julia', stopURL: process.env.LOCALHOST ? 'http://localhost:3000/magic/spell/' : `https://${SUBDOMAIN}.julia.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  juliaNfcVerify: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'julia', stopURL: process.env.LOCALHOST ? 'http://localhost:3000/magic/spell/' : `https://${SUBDOMAIN}.julia.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  // Dolores MAGIC-routed operations
  doloresUserCreate: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'dolores', stopURL: process.env.LOCALHOST ? 'http://localhost:3005/magic/spell/' : `https://${SUBDOMAIN}.dolores.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  doloresUserPost: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'dolores', stopURL: process.env.LOCALHOST ? 'http://localhost:3005/magic/spell/' : `https://${SUBDOMAIN}.dolores.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  doloresAdminFeeds: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'dolores', stopURL: process.env.LOCALHOST ? 'http://localhost:3005/magic/spell/' : `https://${SUBDOMAIN}.dolores.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  doloresUserShortFormVideo: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'dolores', stopURL: process.env.LOCALHOST ? 'http://localhost:3005/magic/spell/' : `https://${SUBDOMAIN}.dolores.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  doloresUserVideoTags: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'dolores', stopURL: process.env.LOCALHOST ? 'http://localhost:3005/magic/spell/' : `https://${SUBDOMAIN}.dolores.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  doloresAdminInstagramCredentials: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'dolores', stopURL: process.env.LOCALHOST ? 'http://localhost:3005/magic/spell/' : `https://${SUBDOMAIN}.dolores.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  doloresAdminInstagramCredentialsDelete: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'dolores', stopURL: process.env.LOCALHOST ? 'http://localhost:3005/magic/spell/' : `https://${SUBDOMAIN}.dolores.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  doloresAdminInstagramRefresh: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'dolores', stopURL: process.env.LOCALHOST ? 'http://localhost:3005/magic/spell/' : `https://${SUBDOMAIN}.dolores.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  // Sanora MAGIC-routed operations
  sanoraUserCreate: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'sanora', stopURL: process.env.LOCALHOST ? 'http://localhost:7243/magic/spell/' : `https://${SUBDOMAIN}.sanora.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  sanoraUserProcessor: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'sanora', stopURL: process.env.LOCALHOST ? 'http://localhost:7243/magic/spell/' : `https://${SUBDOMAIN}.sanora.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  sanoraUserProduct: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'sanora', stopURL: process.env.LOCALHOST ? 'http://localhost:7243/magic/spell/' : `https://${SUBDOMAIN}.sanora.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  sanoraUserProductImage: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'sanora', stopURL: process.env.LOCALHOST ? 'http://localhost:7243/magic/spell/' : `https://${SUBDOMAIN}.sanora.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  sanoraUserProductArtifact: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'sanora', stopURL: process.env.LOCALHOST ? 'http://localhost:7243/magic/spell/' : `https://${SUBDOMAIN}.sanora.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  sanoraUserOrders: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'sanora', stopURL: process.env.LOCALHOST ? 'http://localhost:7243/magic/spell/' : `https://${SUBDOMAIN}.sanora.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  // Addie MAGIC-routed operations
  addieUserCreate: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'addie', stopURL: process.env.LOCALHOST ? 'http://localhost:3005/magic/spell/' : `https://${SUBDOMAIN}.addie.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  addieUserProcessor: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'addie', stopURL: process.env.LOCALHOST ? 'http://localhost:3005/magic/spell/' : `https://${SUBDOMAIN}.addie.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  addieUserProcessorIntent: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'addie', stopURL: process.env.LOCALHOST ? 'http://localhost:3005/magic/spell/' : `https://${SUBDOMAIN}.addie.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  addieUserProcessorIntentWithoutSplits: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'addie', stopURL: process.env.LOCALHOST ? 'http://localhost:3005/magic/spell/' : `https://${SUBDOMAIN}.addie.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  addieChargeSavedMethod: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'addie', stopURL: process.env.LOCALHOST ? 'http://localhost:3005/magic/spell/' : `https://${SUBDOMAIN}.addie.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  addiePaymentMethodsIntent: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'addie', stopURL: process.env.LOCALHOST ? 'http://localhost:3005/magic/spell/' : `https://${SUBDOMAIN}.addie.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  addieSavedPaymentMethodDelete: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'addie', stopURL: process.env.LOCALHOST ? 'http://localhost:3005/magic/spell/' : `https://${SUBDOMAIN}.addie.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  addieMoneyProcessor: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'addie', stopURL: process.env.LOCALHOST ? 'http://localhost:3005/magic/spell/' : `https://${SUBDOMAIN}.addie.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  addieUserDelete: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'addie', stopURL: process.env.LOCALHOST ? 'http://localhost:3005/magic/spell/' : `https://${SUBDOMAIN}.addie.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  // Covenant MAGIC-routed operations
  covenantUserCreate: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'covenant', stopURL: process.env.LOCALHOST ? 'http://localhost:3011/magic/spell/' : `https://${SUBDOMAIN}.covenant.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  covenantContract: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'covenant', stopURL: process.env.LOCALHOST ? 'http://localhost:3011/magic/spell/' : `https://${SUBDOMAIN}.covenant.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  covenantContractUpdate: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'covenant', stopURL: process.env.LOCALHOST ? 'http://localhost:3011/magic/spell/' : `https://${SUBDOMAIN}.covenant.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  covenantContractSign: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'covenant', stopURL: process.env.LOCALHOST ? 'http://localhost:3011/magic/spell/' : `https://${SUBDOMAIN}.covenant.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  covenantContractDelete: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'covenant', stopURL: process.env.LOCALHOST ? 'http://localhost:3011/magic/spell/' : `https://${SUBDOMAIN}.covenant.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  // Prof MAGIC-routed operations
  profUserProfile: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'prof', stopURL: process.env.LOCALHOST ? 'http://localhost:3008/magic/spell/' : `https://${SUBDOMAIN}.prof.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  profUserProfileUpdate: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'prof', stopURL: process.env.LOCALHOST ? 'http://localhost:3008/magic/spell/' : `https://${SUBDOMAIN}.prof.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  profUserProfileDelete: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'prof', stopURL: process.env.LOCALHOST ? 'http://localhost:3008/magic/spell/' : `https://${SUBDOMAIN}.prof.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  // Fount MAGIC-routed operations (internal routes)
  fountUserCreate: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'fount-magic', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/magic/spell/' : `https://${SUBDOMAIN}.fount.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  fountUserNineum: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'fount-magic', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/magic/spell/' : `https://${SUBDOMAIN}.fount.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  fountUserNineumAdmin: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'fount-magic', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/magic/spell/' : `https://${SUBDOMAIN}.fount.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  fountUserNineumGalactic: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'fount-magic', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/magic/spell/' : `https://${SUBDOMAIN}.fount.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  fountUserDelete: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'fount-magic', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/magic/spell/' : `https://${SUBDOMAIN}.fount.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  fountUserTransfer: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'fount-magic', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/magic/spell/' : `https://${SUBDOMAIN}.fount.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  },

  fountUserGrant: {
    cost: 50, // MP cost
    destinations: [
      {stopName: 'fount-magic', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/magic/spell/' : `https://${SUBDOMAIN}.fount.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount',
    mp: true
  }
};
