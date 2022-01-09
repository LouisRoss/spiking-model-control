import { useState, useEffect, useCallback } from 'react';
import { RadioGroup, RadioButton } from 'react-radio-buttons';
import { useParams } from 'react-router-dom';
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

const ControlPanel = () => {
  const { model } = useParams();
  const [cpuhistory, setCpuhistory] = useState([]);
  const [connected, setConnected] = useState(false);
  const [deploymentSelected, setDeploymentSelected] = useState(false);
  const [deployedEngines, setDeployedEngines] = useState([]);
  const [selectedEngine, setSelectedEngine] = useState('');
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setCpuhistory(new Array(200).fill(0));
    var messages = document.getElementById('messages');
    messages.value += '\nDeploying model ' + model + '\n';
}, []);
/*
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
*/
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

  const handleDeploymentChange = (deploymentName) => {
    const messages = document.getElementById('messages');
    messages.value += `Changed to deployment '${deploymentName}'\n`

    if (deploymentName.length === 0) {
      setDeploymentSelected(false);
      if (handleDeploymentUpdate) {
        handleDeploymentUpdate('', []);
      }
      return;
    }

    setDeploymentSelected(true);
    fetch(basePackagerUrl + '/model/' + model + '/deployment/' + deploymentName, { method: 'GET', mode: 'cors' })
    .then(data => data.json())
    .then(response => {
      if (messages) {
        messages.value += `Retrieved deployment '${deploymentName}' for model '${model}'\n`
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

    fetch(basePackagerUrl + '/model/' + model + '/deployment/' + editedDeployment.deploymentName, {
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
        messages.value += `Saved deployment '${editedDeployment.deploymentName}' for model '${model}'\n`
      }
      setDirty(false);
    });
  }

  const handleDeployClick = () => {
    if (document.getElementById('deploymentsselectlist').selectedIndex === -1) {
      return;
    }

    const deploymentName = document.getElementById('deploymentsselectlist').value;
    const engines = getEditedDeployment().engines;

    const distinctEngines = [...new Set(engines)];
    distinctEngines.forEach(engine => {
      restManager.Deploy(model, deploymentName, engine, (data) => {
        console.log(`Deploy response: ${JSON.stringify(data)}`);
      });
    });

    handleSelectedEngineChange(distinctEngines[0]);
    setDeployedEngines(distinctEngines);
  }

  const handleUndeployClick = () => {
    deployedEngines.forEach(engine => {
      restManager.Undeploy(engine, (data) => {
        console.log(`Undeploy response: ${JSON.stringify(data)}`);
      });
    });

    setDeployedEngines([]);
  }

  const handleSelectedEngineChange = (engine) => {
    restManager.SetSelectedEngine(engine, (data) => {
      console.log(`Select engine response: ${JSON.stringify(data)}`);
    });

    setSelectedEngine(engine);
  }

  const memoizedDirtyFlag = useCallback((dirty) => setDirty(dirty), []);

  /*
                  {deployedEngines.map(engine => (
                  <div key={engine} className='deployedengines'>
                    <label>
                      <input type="radio" value={engine} name="deployedengines" /> {engine}
                    </label>
                  </div>
                  ))}
  */
  return (
    <section className="mainbody">
      <section className="toppane">
        <section className="leftpane">
          <div className="connectbar">

            <div className="workingpanel">
              <div className="statuspanel">
                <div className='deploymentcontrol'>
                  <div className="deploymentpanel">
                    <DeploymentsManager selectedModel={model} onChangeHandler={handleDeploymentChange}/>
                    <DeploymentManager selectedModel={model} registerUpdateFunc = {(updateHandler) => handleDeploymentUpdate = updateHandler} registerGetDeploymentFunc = {(getDeployment) => getEditedDeployment = getDeployment} dirtyFlag = {memoizedDirtyFlag} />
                    <div className="deploymentbuttons">
                      <ConnectDisconnectButton value="Apply" disabled={() => !dirty} onClick={handleApplyClick}/>
                      <ConnectDisconnectButton value="Deploy" disabled={() => deployedEngines.length !== 0 || !deploymentSelected || dirty} onClick={handleDeployClick}/>
                      <ConnectDisconnectButton value="Undeploy" disabled={() => deployedEngines.length === 0} onClick={handleUndeployClick}/>
                    </div>
                  </div>
                  <RadioGroup onChange={handleSelectedEngineChange} value={deployedEngines[0]} >
                    {deployedEngines.map(engine => (
                      <RadioButton key={engine} value={engine}>
                        {engine}
                      </RadioButton>
                    ))}
                  </RadioGroup>                  
                </div>
                <div className="messages">
                  <textarea name="messages" id="messages" cols="120" rows="12" readOnly></textarea>
                  <textarea name="status" id="status" cols="120" rows="5" readOnly></textarea>
                </div>
              </div>
            </div>
          </div>
        </section>
        <StatusAndControlPanel restManager={restManager} handleCpuHistory = {(data) => setCpuhistory(data)} engine={selectedEngine} />
      </section>
      <div className="stripchartbar">
        <div className="header">% CPU</div>
        <LineChart svgHeight="40" svgWidth="400" color='#333333' data={cpuhistory} />
      </div>
    </section>
  );
}

export { ControlPanel };
