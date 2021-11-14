import { useState, useEffect, useCallback } from 'react';
import { RestManager } from "./rest-manager";
import { StatusAndControlPanel } from './status-control.js';
import { ConnectDisconnectButton } from './property-switch.js';
import { LineChart } from './line-chart.js'
import { DeploymentManager } from './deployment-manager.js';
import { DeploymentsManager } from './deployments-manager.js';
import configuration from './configfiles/configuration.json';
import './App.css';

const basePackagerUrl = configuration.services.modelPackager.host + ':' + configuration.services.modelPackager.port;

var restManager = RestManager.getInstance();

// TODO - get from URL.
var selectedModel = 'layer';

const ControlPanel = () => {
  const [cpuhistory, setCpuhistory] = useState([]);
  const [connected, setConnected] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setCpuhistory(new Array(200).fill(0));
  }, []);

  useEffect(() => {
    const timerId = setInterval(statusPoll, 500);
    return () => {
      clearInterval(timerId);
    }
  });

  const statusPoll = () => {
    restManager.StatusRequestResponse(data => {
      setConnected(data.response.status.connected);
      distributStatusResonse(data.response)
      if (handleStatusControlUpdate) {
        handleStatusControlUpdate(data.response);
      }

      if (handleCpuChartUpdate) {
        handleCpuChartUpdate(data.response.status.cpuhistory);
      }
    });
  }

  // Provided by StatusAndControlPanel component.
  var handleStatusControlUpdate = (engineStatus) => null;

  // Provided by LineChart component.
  var handleCpuChartUpdate = (cpuhistory) => null;

  // Provided by DeploymentManager component.
  var handleDeploymentUpdate = (deployment) => null;
  var getEditedDeployment = (deployment) => null;

  const distributStatusResonse = data => {
    var status = document.getElementById('status');
    //status.value = JSON.stringify(data);
    
    if (typeof data.error !== 'undefined' && data.error != null && typeof data.errordetail !== 'undefined') {
      status.value = `Error: ${data.error} - ${data.errordetail}`
    }
  }

  const handleConnectionClick = (connect) => {
    var servers = document.getElementById('servers');
    
    let connectReq;
    if (connect) {
      connectReq = { 'request': 'connect', 'server': servers.value };
    } else {
      connectReq = { 'request': 'disconnect', 'server': '' };
    }

    restManager.ConnectionRequestResponse(connectReq, (data) => {
      var messages = document.getElementById('messages');
      messages.value += '\n' + JSON.stringify(data);
      window.scrollTo(0, document.body.scrollHeight);
    });
  }

  const handleDeploymentChange = (deploymentName) => {
    const messages = document.getElementById('messages');
    messages.value += `Changed to deployment '${deploymentName}'\n`

    if (deploymentName.length === 0) {
      if (handleDeploymentUpdate) {
        handleDeploymentUpdate('', []);
      }
      return;
    }

    fetch(basePackagerUrl + '/model/' + selectedModel + '/deployment/' + deploymentName, { method: 'GET', mode: 'cors' })
    .then(data => data.json())
    .then(response => {
      if (messages) {
        messages.value += `Retrieved deployment '${deploymentName}' for model '${selectedModel}'\n`
      }
      if (handleDeploymentUpdate) {
        handleDeploymentUpdate(deploymentName, response);
      }
    });
  }

  const handleApplyClick = () => {
    const messages = document.getElementById('messages');

    const editedDeployment = getEditedDeployment();
    messages.value += `Saving edited deployment '${editedDeployment.deploymentName}'\n`

    fetch(basePackagerUrl + '/model/' + selectedModel + '/deployment/' + editedDeployment.deploymentName, {
      method: 'PUT', 
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(editedDeployment.engines),
       mode: 'cors'
    })
    .then(data => data.json())
    .then(response => {
      if (messages) {
        messages.value += `Saved deployment '${editedDeployment.deploymentName}' for model '${selectedModel}'\n`
      }
      setDirty(false);
    });
  }

  const memoizedDirtyFlag = useCallback((dirty) => setDirty(dirty), []);

  return (
    <section className="mainbody">
      <section className="toppane">
        <section className="leftpane">
          <div className="connectbar">
            <div id="connectionPanel">
              <ConnectDisconnectButton ident="connectButton" value="Connnect" disabled={() => connected} onClick={() => handleConnectionClick(true)}/>
              <select name="servers" id="servers">
                <option value="192.168.1.142">192.168.1.142</option>
                <option value="127.0.0.1">127.0.0.1</option>
              </select>
              <ConnectDisconnectButton ident="connectButton" value="Disconnnect" disabled={() => !connected} onClick={() => handleConnectionClick(false)}/>
            </div>

            <div className="workingpanel">
              <div className="statuspanel">
                <div className="deploymentpanel">
                  <DeploymentsManager selectedModel={'layer'} onChangeHandler={handleDeploymentChange}/>
                  <DeploymentManager selectedModel={'layer'} registerUpdateFunc = {(updateHandler) => handleDeploymentUpdate = updateHandler} registerGetDeploymentFunc = {(getDeployment) => getEditedDeployment = getDeployment} dirtyFlag = {memoizedDirtyFlag} />
                  <ConnectDisconnectButton value="Apply" disabled={() => !dirty} onClick={handleApplyClick}/>
                </div>
                <div className="messages">
                  <textarea name="messages" id="messages" cols="120" rows="12" readOnly></textarea>
                  <textarea name="status" id="status" cols="120" rows="5" readOnly></textarea>
                </div>
              </div>
            </div>
          </div>
        </section>
        <StatusAndControlPanel restManager={restManager} registerUpdateFunc = {(updateHandler) => handleStatusControlUpdate = updateHandler} />
      </section>
      <div className="stripchartbar">
        <div className="header">% CPU</div>
        <LineChart svgHeight="40" svgWidth="400" data={cpuhistory} color='#333333' registerUpdateFunc = {(updateHandler) => handleCpuChartUpdate = updateHandler} />
      </div>
    </section>
  );
}

export { ControlPanel };
