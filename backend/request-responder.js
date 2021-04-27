var singleton = require('./connection-manager');

class RequestResponder {
  constructor() {
      this.controller = singleton.getInstance();
  }

  handleConnectionRequest(req) {
    if (req && req.request) {
      if (req.request == 'connect') {
        var success = this.controller.attemptConnection(req.server);
        return { response: (success ? "Ok" : "Already Connected") };
      }
      else if (req.request == 'disconnect') {
        var success = this.controller.disconnect();
        return { response: (success ? "Ok" : "Already Disconnected") };
      }
      else {
        console.log(`Unrecognized connection request ${req.request}`);
        return { response: `Unrecognized connection request ${req.request}` };
      }
    }

    return { response: "Invalid request format" };
  }

  handleStatusRequest(req) {
    if (req && req.request) {
      if (req.request == 'status') {
        var status = this.controller.getStatus();
        return { response: "Ok", status: JSON.stringify(status) };
      }
      else {
        console.log(`Unrecognized status request ${req.request}`);
        return { response: `Unrecognized status request ${req.request}` };
      }
    }

    return { response: "Invalid request format" };
  }

}


module.exports = RequestResponder;
