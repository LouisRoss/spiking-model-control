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

  handleStatusRequest() {
    var status = this.controller.getStatus();
    return { response: "Ok", status: status };
  }

  handlePassthroughRequest(req, callback) {
    if (req && req.request) {
      if (req.request == 'passthrough') {
        var status = this.controller.passthrough(req.packet, (data) => callback(data));

        if (status) {
          console.log('Passthrough command in progress');
        } else {
          console.log('Passthrough command failed');
          callback({ response: `Unable to complete passthrough request ${req.request}` });
        }

        return status;
      }
      else {
        console.log(`Unrecognized passthrough request ${req.request}`);
        callback({ response: `Unrecognized passthrough request ${req.request}` });
        return false;
      }
    }

    callback({ response: "Invalid request format" });
    return false;
  }

}


module.exports = RequestResponder;
