
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
	    stopURL: fountUrl + 'magic/spell/'
	}
    ],
    resolver: 'fount',
    mp: true
  },
  joinup: {
    cost: 400,
    destinations: [
      {stopName: 'joan', stopURL: process.env.LOCALHOST ? 'http://localhost:3004/magic/spell/' : `https://${SUBDOMAIN}.joan.allyabase.com/magic/spell/`}, 
      {stopName: 'bdo', stopURL: process.env.LOCALHOST ? 'http://localhost:3003/magic/spell/' : `https://${SUBDOMAIN}.bdo.allyabase.com/magic/spell/`}, 
      {stopName: 'julia', stopURL: process.env.LOCALHOST ? 'http://localhost:3000/magic/spell/' : `https://${SUBDOMAIN}.julia.allyabase.com/magic/spell/`},
      {stopName: 'pref', stopURL: process.env.LOCALHOST ? 'http://localhost:3002/magic/spell/' : `https://${SUBDOMAIN}.pref.allyabase.com/magic/spell/`},
      {stopName: 'addie', stopURL: process.env.LOCALHOST ? 'http://localhost:3005/magic/spell/' : `https://${SUBDOMAIN}.addie.allyabase.com/magic/spell/`},
      {stopName: 'fount', stopURL: process.env.LOCALHOST ? 'http://localhost:3006/resolve/' : `https://${SUBDOMAIN}.fount.allyabase.com/resolve/`}
    ],
    resolver: 'fount'
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
  }
};
