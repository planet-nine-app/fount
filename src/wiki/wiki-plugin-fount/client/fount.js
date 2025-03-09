let fountUser;
let transfers = [];
let lastNineumCount;
let lastTransfersCount;

function getTransfers($item) {
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
                  transfers.push(user.uuid);
                  emit($item, {});
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
};

function emit($item, item) {
  console.log('emit has been called');

  function displayTransfers(_transfers) {
    let buttons = '';
    _transfers.forEach(transfer => {
      buttons += `
        <br>
        <button id="transferButton">Transfer to ${transfer}</button>`;
    });

    return buttons;
  };

  function displayUser(user) {
    $item.empty(); 
  console.log('should display user', user);
     $item.append(`
	<div style="background-color:#eee; padding:8px;">
	  <p>Welcome ${user.uuid}</p>
	  <br>
	  <p>You have ${user.nineumCount} nineum.</p>
          <br>
          <p>${user.nineum.join(', ')}</p>
	  <br>
	  <button id="grantButton">Grant</button>
          ${displayTransfers(transfers)}
	</div>`);

     /*if(lastNineumCount === user.nineumCount && lastTransfersCount === transfers.length) {
       return;
     }
     lastNineumCount = user.nineumCount;
     lastTransfersCount = transfers.length; // TODO fix this

     bind($item, item);
*/
     attachListeners($item, item);
     return user;
  };

  if(!fountUser) {
console.log('no fountUser');
    const user = fetch('/plugin/fount/user')
      .then(res => res.json())
      .then(user => fountUser = user)
      .then(_ => displayUser(fountUser)) 
      .catch(err => console.warn('could not get fount user', err));

    getTransfers($item);
  } else {
    displayUser(fountUser);
  }
};

function bind($item, item) {};

function attachListeners($item, item) {
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

  $item.find('#transferButton').click(function(evt) {
console.log('transfer button clicked', evt);
    const toUUID = evt.currentTarget.innerHTML.split(' ').pop();
console.log('now you can transfer to uuid: ', toUUID);
    const payload = {
      uuid: fountUser.uuid,
      toUUID,
      nineum: [fountUser.nineum.pop()]
    };
    
    const opts = {
      method: "post",
      body: JSON.stringify(payload),
      headers: {'Content-Type': 'application/json'}
    };

    fetch('/plugin/fount/transfer', opts)
      .then(res => res.json())
      .then($ => console.log('received response from transfer', $))
      .catch(console.warn);
  });
};

if(window) {
console.log('trying to attach fount');
console.log(emit);
console.log('bind', bind);
  window.plugins['fount'] = {emit, bind};
}
