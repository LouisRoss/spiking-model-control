var connectForm = document.getElementById('connectForm');
var servers = document.getElementById('servers');
var messages = document.getElementById('messages');

var form = document.getElementById('form');
var input = document.getElementById('input');

connectForm.addEventListener('submit', function(e) {
  e.preventDefault();
  var connectReq = { 'server': servers.value };
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
          var item = document.createElement('li');
          item.textContent = "Error response"
          messages.appendChild(item);
        }
      })
      .then(data => {
        console.log(data);
        var item = document.createElement('li');
        item.textContent = JSON.stringify(data);
        messages.appendChild(item);
  })
  .catch(error => {
    var item = document.createElement('li');
    item.textContent = "Error"
    messages.appendChild(item);
    console.log(`Error ${error}`);
  });
});

