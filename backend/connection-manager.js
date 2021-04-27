const net = require('net');

client = null;
const queryStatus = { Query: "Status" };

status = {};


class PrivateSingleton {
  constructor() {

    setInterval(this.statusPoll, 1500);
  }
  /*
  parseRequest(req) {
    if (req && req.request) {
      if (req.request == 'connect') {
        this.attemptConnection(req.server);
        return { response: "Ok" };
      }
      else if (req.request == 'disconnect') {
        if (client) {
          client.destroy();
          client = null;
        }
        return { response: "Ok" };
      }
      else {
        console.log(`Unrecognized request ${req.request}`);
        return { response: `Unrecognized request ${req.request}` };
      }
    }
    
    return { response: "Invalid request format" };
  }
  */
  statusPoll() {
    if (client) {
      console.log('Polling for status');
      client.write(JSON.stringify(queryStatus));
    }
  }
  
  isConnected() {
    return client != null;
  }

  disconnect() {
    if (this.isConnected()) {
      status.connected = false;
      client.destroy();
      client = null;

      return true;
    }

    return false;
  }

  getStatus() {
    console.log(`Getting current status: ${JSON.stringify(status)}`);
    return status;
  }

  attemptConnection(hostName)
  {
    if (this.isConnected()) {
      return false;
    }

    console.log(`Attemtpting connection with http://${hostName}:8000`);
    var option = {port:8000, host:hostName};
    client = net.createConnection(option, function () {
      status.connected = true;
      console.log('Connection local address : ' + client.localAddress + ":" + client.localPort);
      console.log('Connection remote address : ' + client.remoteAddress + ":" + client.remotePort);
    });

    client.setTimeout(10000);
    client.setEncoding('utf8');

    return this.setupClient();
  }

  setupClient() {
    // When receive server send back data.
    client.on('data', function (data) {
      if (data) {
        status.connected = true;
        var fullResponse = JSON.stringify(data).trim();
        if (fullResponse && fullResponse.length > 0) {
          console.log('Server return data : ' + fullResponse);
          var response = JSON.parse(data);
          if (response.Query.Query == 'Status') {
            status = { ...status, ...response.Response };
            console.log('Capturing Status: ' + JSON.stringify(status));
          }
        }
      }
    });

    // When connection disconnected.
    client.on('end', function () {
        console.log('Client socket disconnect. ');
        this.disconnect();
    });

    client.on('timeout', function () {
        console.log('Client connection timeout. ');
        this.disconnect();
    });

    client.on('error', function (err) {
        console.error(JSON.stringify(err));
        this.disconnect();
    });

    return true;
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
