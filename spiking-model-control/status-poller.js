const net = require('net');
var client = null;

const queryStatus = { Query: "Status" };

function statusPoll() {
  if (client) {
    console.log('Polling for status');
    client.write(JSON.stringify(queryStatus));
  }
}

setInterval(statusPoll, 1500);


class PrivateSingleton {
  constructor() {
    this.status = '';
  }

  parseRequest(req) {
    if (req && req.request) {
      if (req.request == 'connect') {
        this.attemptConnection(req.server);
      }
      else {
        console.log(`Unrecognied request ${req.request}`);
      }
    }
  }

  attemptConnection(hostName)
  {
    console.log(`Attemtpting connection with http://${hostName}:8000`);
    var option = {port:8000, host:hostName};
    client = net.createConnection(option, function () {
      console.log('Connection local address : ' + client.localAddress + ":" + client.localPort);
      console.log('Connection remote address : ' + client.remoteAddress + ":" + client.remotePort);
    });

    client.setTimeout(10000);
    client.setEncoding('utf8');

    this.setupClient();
  }

  setupClient() {
    // When receive server send back data.
    client.on('data', function (data) {
      if (data) {
        var fullResponse = JSON.stringify(data).trim();
        if (fullResponse && fullResponse.length > 0) {
          console.log('Server return data : ' + fullResponse);
          var response = JSON.parse(data);
          if (response.Query.Query == 'Status') {
            this.status = JSON.stringify(response.Response);
            console.log('Capturing Status as string: ' + this.status);
          }
        }
      }
    });

    // When connection disconnected.
    client.on('end', function () {
        console.log('Client socket disconnect. ');
        client = null;
    });

    client.on('timeout', function () {
        console.log('Client connection timeout. ');
        client = null;
    });

    client.on('error', function (err) {
        console.error(JSON.stringify(err));
        client = null;
    });
  }
}

class statusPoller {
  constructor() {
    throw new Error('Use statusPoller.getInstance()');
  }
  
  static getInstance() {
    if (!statusPoller.instance) {
      statusPoller.instance = new PrivateSingleton();
    }
    return statusPoller.instance;
  }
}

module.exports = statusPoller;
