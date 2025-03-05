let fountUser;

function emit($item, item) {
  if(!fountUser) {
    const user = fetch('/plugin/pn-fount/user')
      .then(user => fountUser = user)
      .then(user => $item.append(`
        <div style="background-color:#eee; padding:8px;">
          <p>Should show the user here</p>
          <br>
          ${JSON.stringify(user)}
        </div>`))
      .catch(err => console.warn('could not get fount user', err));
  }
};

function bind($item, item) {
  console.log('bind has been called');
};

window && window.plugins['fount'] = {emit, bind};
