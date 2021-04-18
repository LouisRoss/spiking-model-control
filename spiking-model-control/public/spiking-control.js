var connectForm = document.getElementById('connectForm');
var servers = document.getElementById('servers');
var messages = document.getElementById('messages');

var form = document.getElementById('form');
var input = document.getElementById('input');

connectForm.addEventListener('submit', function(e) {
  e.preventDefault();
  var connectReq = { 'request': 'connect', 'server': servers.value };
  console.log(`request: ${JSON.stringify(connectReq)}`)

  fetch('http://localhost:5000/connection', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(connectReq)
  })
  .then(res => {
      if (res.ok) {
          return res.json();
        } else {
          messages.value += '\n' + "Error response";
        }
      })
      .then(data => {
        console.log(data);
        messages.value += '\n' + JSON.stringify(data);
        window.scrollTo(0, document.body.scrollHeight);
  })
  .catch(error => {
    messages.value += '\n' + `Error ${error}`;
    console.log(`Error ${error}`);
  });
});

