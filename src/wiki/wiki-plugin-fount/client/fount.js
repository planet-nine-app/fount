let fountUser;

function emit($item, item) {
  console.log('emit has been called');

  function displayUser(user) {
console.log('should display user', user);
     $item.append(`
        <div style="background-color:#eee; padding:8px;">
          <p>Should show the user here</p>
          <br>
          ${JSON.stringify(user)}
        </div>`);
  };

  if(!fountUser) {
    const user = fetch('/plugin/fount/user')
      .then(res => res.json())
      .then(displayUser)
      .then(user => fountUser = user)
      .catch(err => console.warn('could not get fount user', err));
  } else {
    displayUser(fountUser);
  }
};

function bind($item, item) {
  console.log('bind has been called');
  emit($item, item);
};

if(window) {
  window.plugins['fount'] = {emit, bind};
}
