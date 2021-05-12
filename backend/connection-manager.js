const net = require('net');

client = null;

status = { connected: false };


class PrivateSingleton {
  constructor() {
    this.passthroughCallback = null;
    setInterval(this.dynamicStatusPoll, 1000);
  }

  dynamicStatusPoll() {
    if (client) {
      console.log('Polling for dynamic status');
      client.write(JSON.stringify({ query: "dynamicstatus" }));
    }
  }

  fullStatusPoll() {
    if (client) {
      console.log('Polling for full status');
      client.write(JSON.stringify({ query: "fullstatus" }));
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
    //console.log(`Getting current status: ${JSON.stringify(status)}`);
    return status;
  }

  passthrough(query, callback) {
    if (client == null) {
      console.log('Attempt to send passthrough to unconnected model engine');
      return false;
    }

    this.passthroughCallback = callback;
    console.log(`Sending passthrough command ${query.query}`);
    client.write(JSON.stringify(query));

    return true;
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

    return this.setupClient();
  }
  
  setupClient() {
    client.setTimeout(10000);
    client.setEncoding('utf8');
  
    // When receive server send back data.
    client.on('data',  (data) => this.handleModelResponses(data));

    // When connection disconnected.
    client.on('end', () => {
        console.log('Client socket disconnect. ');
        this.disconnect();
    });

    client.on('timeout', () => {
        console.log('Client connection timeout. ');
        this.disconnect();
    });

    client.on('error', (err) => {
        console.error(JSON.stringify(err));
        this.disconnect();
    });

    return true;
  }

  handleModelResponses(data) {
    if (data) {
      status.connected = true;
      var fullResponse = JSON.stringify(data).trim();
      if (fullResponse && fullResponse.length > 0) {
        console.log('Server return data : ' + fullResponse);

        var response = JSON.parse(data);
        this.parseModelResponses(response);
      }
    }
  }

  parseModelResponses(response) {
    if (response.response.result && response.response.result != 'ok') {
      status[error] = response.response.error;
      status[errordetail] = response.response.errordetail;
    }
    else if (response.response.result && response.response.result == 'ok' && response.query) {
      if (response.query.query == 'fullstatus' || response.query.query == 'dynamicstatus') {
        status = { ...status, ...response.response.status };
        status.error = null;
        status.errordetail = null;
        console.log('Capturing Status: ' + JSON.stringify(status));
      }
      else if (response.query.query == 'control' || response.query.query == 'configurations') {
        if (response.response.status) {
          status = { ...status, ...response.response.status };
        }
        status.error = null;
        status.errordetail = null;
        console.log('Received control response, returning' + JSON.stringify(response.response));
        if (this.passthroughCallback) {
          this.passthroughCallback(response.response);
          this.passthroughCallback = null;
        }
      }
    }
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
