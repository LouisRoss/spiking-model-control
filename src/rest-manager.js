import configuration from './configfiles/configuration.json';
const baseControlConnectorUrl = configuration.services.controlConnector.host + ':' + configuration.services.controlConnector.port;

class PrivateSingleton {

  ConnectionRequestResponse(engine, request, callback) {
    var init = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', },
      body: JSON.stringify(request)
    };
    this.RequestResponse('engine/' + engine + '/connection', init, callback);
  }
  
  ConfigurationsRequestResponse(callback) {
    var init = {
      method: 'GET',
    };
    this.RequestResponse('configurations', init, callback);
  }
  
  StatusRequestResponse(callback) {
    var init = {
      method: 'GET',
    };
    this.RequestResponse('status', init, callback);
  }
  /*
    FullStatusRequestResponse(callback) {
    var init = {
      method: 'GET',
    };
    this.RequestResponse('fullstatus', init, callback);
  }
  */
  Deploy(model, deployment, engine, callback) {
    this.PassthroughRequestResponse(engine, { query: 'deploy', model: model, deployment: deployment, engine: engine }, callback);
  }

  Undeploy(engine, callback) {
    this.PassthroughRequestResponse(engine, { query: 'deploy', model: '', deployment: '', engine: engine }, (response) => {
      console.log(`Response from undeploy: ${JSON.stringify(response)}, starting disconnect`);
      this.ConnectionRequestResponse(engine, { query: 'disconnect' }, (dummy) => callback(response));
    });
  }

  PassthroughRequestResponse(engine, request, callback) {
   var init = {
     method: 'POST',
     headers: { 'Content-Type': 'application/json', },
     body: JSON.stringify(request)
    };
    this.RequestResponse('engine/' + engine + '/passthrough', init, callback);
  }
  
  RequestResponse(resource, init, callback) {
    var messages = document.getElementById('messages');
    
    if (init.body) {
      console.log(`request: ${init.body}`)
    }

    fetch(baseControlConnectorUrl + '/' + resource, init)
    .then(res => {
      if (res.ok) {
        return res.json();
      } else {
        messages.value += "\nError response";
      }
    })
    .then(data => {
      callback(data);
    })
    .catch(error => {
      messages.value += `\nError ${error}`;
      console.log(`Error ${error}`);
      
      var disconnectedResponse = {query:init.body, response:{result:'ok', status: { connected: false }}};
      callback(disconnectedResponse);
    });
  }
}


class RestManager {
    constructor() {
      throw new Error('Use RestManager.getInstance()');
    }
    
    static getInstance() {
      if (!RestManager.instance) {
        RestManager.instance = new PrivateSingleton();
      }
      return RestManager.instance;
    }
  }
  
  export { RestManager };
