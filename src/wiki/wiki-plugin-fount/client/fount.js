let fountUser;
let lastNineumCount;

function emit($item, item) {
  console.log('emit has been called');

  $item.empty(); 

  function displayUser(user) {
  console.log('should display user', user);
    if(user.nineumCount === lastNineumCount) {
      return;
    }
    lastNineumCount = user.nineumCount;
     $item.append(`
	<div style="background-color:#eee; padding:8px;">
	  <p>Welcome ${user.uuid}</p>
	  <br>
	  <p>You have ${user.nineumCount} nineum.</p>
	  <br>
	  <button id="grantButton">Grant</button>
          <br>
          <button id="transferButton">Transfer</button>
	</div>`);

     bind($item, item);

     return user;
  };

  if(!fountUser) {
console.log('no fountUser');
    const user = fetch('/plugin/fount/user')
      .then(res => res.json())
      .then(user => fountUser = user)
      .then(_ => displayUser(fountUser)) 
      .catch(err => console.warn('could not get fount user', err));
  } else {
    displayUser(fountUser);
  }
};

function bind($item, item) {
  console.log('bind has been called');
  $item.find('#grantButton').click(function() {
    const payload = {
      "timestamp": new Date().getTime() + '',
      "spell": "test",
      "casterUUID": fountUser.uuid,
      "totalCost": 400,
      "mp": 400,
      "ordinal": fountUser.ordinal,
      "gateways": []
    };

    const opts = {
      "method": "post",
      "body": JSON.stringify(payload),
      "headers": {'Content-Type': 'application/json'}
    };

console.log('grant clicked');
    fetch('/plugin/fount/resolve', opts)
      .then(res => res.json())
      .then(user => fountUser = user)
      .then(_ => emit($item, item))
      .catch(err => console.warn('could not grant', err));
  });

  $item.find('#transferButton').click(function() {
    const page = $item.parents('.page').data('data');
console.log(page);
console.log(page.story.filter($ => $.type === 'signature2').map($ => $.signatures));
    if(page && page.story) {
      const signatures = page.story.filter($ => $.type === 'signature2').map($ => $.signatures);
      signatures.forEach(entry => {
        for(let domain in entry) {
	  const encodedSite = encodeURIComponent(domain);
  console.log('domain is', domain, 'and econdedSite is', encodedSite);

	  fetch(`/plugin/signature2/owner-key?site=${encodedSite}`)
	  .then(res => res.json())
	  .then(domainKey => {
	    const participant = entry[domain];
console.log('participant', participant, 'has keys: ', domainKey);

	    for(let hash in participant) {
	      const signature = participant[hash];
	      const message = signature.timestamp + signature.rev + signature.algo + signature.sum;
console.log('verifying message: ', message);

	      fetch(`/plugin/signature2/verify?signature=${signature.signature}&message=${message}&pubKey=${domainKey["public"]}`)
	      .then(verified => !!verified)
	      .then(verified => {
console.log('verified', verified);
		if(verified) {
		  fetch(`http://${domain}/plugin/fount/user/${domainKey["public"]}`)
                  .then(res => res.json())
		  .then(user => {
console.log('received user', user);
  console.log('Ready to transfer to ', user.uuid);
		  })
		  .catch(console.warn);
		}
	      })
	      .catch(console.warn);
	    }
	  })
	}
      });
    }
  });
};

if(window) {
console.log('trying to attach fount');
console.log(emit);
console.log('bind', bind);
  window.plugins['fount'] = {emit, bind};
}
