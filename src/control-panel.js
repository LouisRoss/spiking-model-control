import { useState, useCallback } from 'react';
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
  const [cpuhistory, setCpuhistory] = useState(new Array(200).fill(0));
  const [selectedDeployment, setSelectedDeployment] = useState('');
  const [deployedEngines, setDeployedEngines] = useState([]);
  const [selectedEngine, setSelectedEngine] = useState('');
  const [dirty, setDirty] = useState(false);

  // Provided by DeploymentManager component.
  var getEditedDeployment = (deployment) => null;

  const handleDeploymentChange = (deploymentName) => {
    const messages = document.getElementById('messages');
    messages.value += `Changed to deployment '${deploymentName}'\n`

    setSelectedDeployment(deploymentName);
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
                    <DeploymentManager selectedModel={model} registerGetDeploymentFunc = {(getDeployment) => getEditedDeployment = getDeployment} dirtyFlag = {memoizedDirtyFlag} deploymentName = {selectedDeployment} />
                    <div className="deploymentbuttons">
                      <ConnectDisconnectButton value="Apply" disabled={() => !dirty} onClick={handleApplyClick}/>
                      <ConnectDisconnectButton value="Deploy" disabled={() => deployedEngines.length !== 0 || selectedDeployment.length === 0 || dirty} onClick={handleDeployClick}/>
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
