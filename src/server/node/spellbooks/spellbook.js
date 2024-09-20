
const SUBDOMAIN = process.env.SUBDOMAIN || 'dev';

const spellbook = {
  joinup: {
    cost: 400,
    destinations: [
      {stopName: 'joan', stopURL: `https://${SUBDOMAIN}.joan.allyabase./magic/spell/`}, 
      {stopName: 'continuebee', stopURL: `https://${SUBDOMAIN}.continuebee.allyabase./magic/spell/`},
      {stopName: 'bdo', stopURL: `https://${SUBDOMAIN}.bdo.allyabase./magic/spell/`}, 
      {stopName: 'julia', stopURL: `https://${SUBDOMAIN}.julia.allyabase./magic/spell/`},
      {stopName: 'pref', stopURL: `https://${SUBDOMAIN}.pref.allyabase./magic/spell/`},
      {stopName: 'addie', stopURL: `https://${SUBDOMAIN}.addie.allyabase./magic/spell/`},
      {stopName: 'fount', stopURL: `https://${SUBDOMAIN}.fount.allyabase./magic/spell/`}
    ],
    resolver: 'fount'
  },

  linkup: {
    cost: 400,
    destinations: [
      {stopName: 'joan', stopURL: `https://${SUBDOMAIN}.joan.allyabase./magic/spell/`}, 
      {stopName: 'continuebee', stopURL: `https://${SUBDOMAIN}.continuebee.allyabase./magic/spell/`},
      {stopName: 'bdo', stopURL: `https://${SUBDOMAIN}.bdo.allyabase./magic/spell/`}, 
      {stopName: 'pref', stopURL: `https://${SUBDOMAIN}.pref.allyabase./magic/spell/`},
      {stopName: 'addie', stopURL: `https://${SUBDOMAIN}.addie.allyabase./magic/spell/`},
      {stopName: 'julia', stopURL: `https://${SUBDOMAIN}.julia.allyabase./magic/spell/`},
      {stopName: 'fount', stopURL: `https://${SUBDOMAIN}.fount.allyabase./magic/spell/`}
    ],
    resolver: 'fount'
  }
};
