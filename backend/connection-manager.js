const net = require('net');

client = null;
const queryStatus = { Query: "Status" };

status = { connected: false, RecordEnable: false };


class PrivateSingleton {
  constructor() {
    this.passthroughCallback = null;
    setInterval(this.statusPoll, 1500);
  }

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
    //console.log(`Getting current status: ${JSON.stringify(status)}`);
    return status;
  }

  passthrough(query, callback) {
    if (client == null) {
      console.log('Attempt to send passthrough to unconnected model engine');
      return false;
    }

    this.passthroughCallback = callback;
    console.log(`Sending passthrough command ${query.Query}`);
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
    if (response.Error) {
      status = { ...status, ...response.Error };
    }
    else if (response.Query) {
      if (response.Query.Query == 'Status') {
        status = { ...status, ...response.Response };
        console.log('Capturing Status: ' + JSON.stringify(status));
      }
      else if (response.Query.Query == 'Control') {
        console.log('Received control response, returning');
        if (this.passthroughCallback) {
          this.passthroughCallback(response.Response);
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
