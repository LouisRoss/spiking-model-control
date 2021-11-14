import { useState, useEffect } from 'react';
import { ConnectDisconnectButton } from './property-switch.js';
import './App.css';
import configuration from './configfiles/configuration.json';
const basePackagerUrl = configuration.services.modelPackager.host + ':' + configuration.services.modelPackager.port;


const DeploymentsManager = ({selectedModel, onChangeHandler}) => {
  const [modelDeployments, setModelDeployments] = useState([]);
  const [createButtonDisabled, setCreateButtonDisabled] = useState(true);
  const [deleteButtonsDisabled, setDeleteButtonsDisabled] = useState(true);
  const [deploymentId, setDeploymentId] = useState(0);

  // Reload the populations for the selected model when the selected model changes.
  useEffect(() => {
    const messages = document.getElementById('messages');
    if (selectedModel && selectedModel !== '') {
      fetch(basePackagerUrl + '/model/' + selectedModel + '/deployments', { method: 'GET', mode: 'cors' })
      .then(data => data.json())
      .then(response => {
        if (messages) {
          messages.value += `Retrieved configured deployments for model '${selectedModel}'\n`
        }

        var deployments = [];
        response.forEach((value, index) => deployments.push({ 'id': index, 'deployment': value }));
        setDeploymentId(response.length);
        setModelDeployments(deployments);

        evaluateDeleteButtonDisabled();
      });
    }
  }, [selectedModel]);

  // Miscellaneous list click events, text change events, etc.
  const handleDeploymentTextChange = () => {
    evaluateCreateButtonDisabled();
  }

  const handleDeploymentSelectedClick = () => {
    evaluateDeleteButtonDisabled();
    const deploymentsSelectListElement = document.getElementById("deploymentsselectlist");
    onChangeHandler(deploymentsSelectListElement.value);
  }

  // The two deployment editing button click events.
  const handleCreateButtonClick = () => {
    const newDeploymentElement = document.getElementById("newdeployment");
    var workingDeployments = [...modelDeployments];

    if (workingDeployments.filter(e => e.deployment === newDeploymentElement.value).length > 0) {
      const statusbarElement = document.getElementById('status');
      statusbarElement.value = `Deployments '${newDeploymentElement.value}' already exists, not creating`;
      newDeploymentElement.value = '';
      evaluateCreateButtonDisabled();
      return;
    }

    fetch(basePackagerUrl + '/model/' + selectedModel + '/deployment/' + newDeploymentElement.value, {
      method: 'PUT', 
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([]),
       mode: 'cors'
    })
    .then(data => data.json())
    .then(response => {
      const messages = document.getElementById('messages');
      if (messages) {
        messages.value += `Created deployment '${newDeploymentElement.value}' for model '${selectedModel}'\n`
      }

      workingDeployments.push({'id': deploymentId, 'deployment': newDeploymentElement.value});
      setDeploymentId(deploymentId + 1);
      setModelDeployments(workingDeployments);
  
      onChangeHandler(newDeploymentElement.value);
  
      newDeploymentElement.value = '';
      document.getElementById("deploymentsselectlist").selectedIndex = -1;
      evaluateCreateButtonDisabled();
      evaluateDeleteButtonDisabled();
    });
  }

  const handleDeleteButtonClick = () => {
    const deploymentsSelectListElement = document.getElementById("deploymentsselectlist");
    if (deploymentsSelectListElement) {
      const selectedIndex = deploymentsSelectListElement.selectedIndex;
      if (selectedIndex !== -1) {
        fetch(basePackagerUrl + '/model/' + selectedModel + '/deployment/' + deploymentsSelectListElement.value, {
          method: 'DELETE', 
          headers: {
            'Content-Type': 'application/json'
          },
          mode: 'cors'
        })
        .then(data => data.json())
        .then(response => {
          const messages = document.getElementById('messages');
          if (messages) {
            messages.value += `Deleted deployment '${deploymentsSelectListElement.value}' for model '${selectedModel}'\n`
          }

          var workingDeployments = [...modelDeployments];
          workingDeployments.splice(selectedIndex, 1);
          setModelDeployments(workingDeployments);
        
          onChangeHandler('');
      
          document.getElementById("deploymentsselectlist").selectedIndex = -1;
          evaluateCreateButtonDisabled();
          evaluateDeleteButtonDisabled();
        });
      }
    }
  }

  // Evaluate control enable flags.
  const evaluateCreateButtonDisabled = () => {
    const newDeploymentElement = document.getElementById("newdeployment");
    var disabled = true;
    if (newDeploymentElement) {
      disabled = newDeploymentElement.value.length === 0;
    }

    setCreateButtonDisabled(disabled);
  }

  const evaluateDeleteButtonDisabled = () => {
    const deploymentsSelectListElement = document.getElementById("deploymentsselectlist");
    var disabled = true;
    if (deploymentsSelectListElement) {
      disabled = deploymentsSelectListElement.selectedIndex === -1;
    }

    setDeleteButtonsDisabled(disabled);
  }

  return (
    <div className="deployments-manager">
      <div className="deployments-management">
        <label>Deployments</label>
        <div className="deployment-group" id="deployment-group">
          <div className="deployment-controls">
            <ConnectDisconnectButton ident="createbutton" value="Create" disabled={() => createButtonDisabled} onClick={handleCreateButtonClick}/>
            <ConnectDisconnectButton ident="deletebutton" value="Delete" disabled={() => deleteButtonsDisabled} onClick={handleDeleteButtonClick}/>
          </div>
          <div className="deployment-controls">
            <input id="newdeployment" type="text" onInput={handleDeploymentTextChange}></input>
            <select name="deploymentsselectlist" id="deploymentsselectlist" onChange={handleDeploymentSelectedClick} size="9">
              {modelDeployments.map(deployment => (
                <option key={deployment.id} value={deployment.deployment}>{deployment.deployment}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}


export { DeploymentsManager };
