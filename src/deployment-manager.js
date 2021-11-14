import { useState, useEffect, useMemo } from 'react';
import ReactDataGrid from "react-data-grid";
import './App.css';
import './deployment-manager.css';
import configuration from './configfiles/configuration.json';
import engineSettings from './configfiles/settings.json';

// Add a blank line at the top for the drop-down editor.
const configuredEngines = [{'name': ''}, ...engineSettings['engines']];

const basePackagerUrl = configuration.services.modelPackager.host + ':' + configuration.services.modelPackager.port;

function getColumns(engineServers, handlEngineChange) {
  return [
    {
      key: 'id',
      name: 'ID',
      width: 60,
      frozen: true,
      resizable: false
    },
    {
      key: 'population',
      name: 'Population',
      width: 120,
      frozen: true,
      resizable: false
    },
    {
      key: 'template',
      name: 'Template',
      width: 120,
      frozen: true
    },
    {
      key: 'engine',
      name: 'Engine',
      width: 120,
      editor: (p) => (
        <select
          autoFocus
          className='engine-editor'
          value={p.row.engine}
          onChange={(e) => { p.onRowChange({ ...p.row, engine: e.target.value }, true); handlEngineChange(); }}
        >
          {engineServers.map((engine) => (
            <option key={engine.name}>{engine.name}</option>
          ))}
        </select>
      ),
      editorOptions: {
        editOnClick: true
      }
    }
  ];
}

var deploymentName = '';


const DeploymentManager = ({selectedModel, registerUpdateFunc, registerGetDeploymentFunc, dirtyFlag}) => {
  const [rows, setRows] = useState([]);
  const [selectedRows, setSelectedRows] = useState(() => new Set());
  const [engineChanged, setEngineChanged] = useState(false);

  useEffect(() => {
    const messages = document.getElementById('messages');
    if (dirtyFlag && selectedModel && selectedModel !== '') {
      fetch(basePackagerUrl + '/model/' + selectedModel + '/population', { method: 'GET', mode: 'cors' })
      .then(data => data.json())
      .then(response => {
        if (messages) {
          messages.value += `Retrieved configured populations for model '${selectedModel}'\n`
        }
        response.templates.forEach((value, index) => { value.id = index; value.engine = ''; });
        setRows(response.templates);
        dirtyFlag(false);
      });
    }
  }, [selectedModel, dirtyFlag]);

  useEffect(() => {
    registerUpdateFunc((deployment, data) => {
      deploymentName = deployment;

      // We need an actual deep copy here!!
      var newRows = [];
      rows.forEach((row, index) => 
        newRows.push({
          'id': row['id'], 
          'population': row['population'], 
          'template': row['template'], 
          'engine': index < data.length ? data[index] : ''
        })
      );

      setRows(newRows);
    });
  }, [registerUpdateFunc, rows]);

  useEffect(() => {
    registerGetDeploymentFunc(() => {
      var engines = [];
      rows.forEach(row => engines.push(row.engine));
      return {deploymentName, engines};
    });
  }, [registerGetDeploymentFunc, rows]);

  useEffect(() => {
    if (engineChanged) {
      var allFilled = true;
      rows.forEach(row => allFilled &= row.engine.length > 0);
      dirtyFlag(allFilled);
      setEngineChanged(false);
    }
  }, [engineChanged, rows, dirtyFlag]);

  const columns = useMemo(() => getColumns(configuredEngines, () => setEngineChanged(true)), []);

  const rowKeyGetter = (row) => {
    return row.id;
  }
  

  return (
    <div className="deployment-manager">
        <ReactDataGrid
          columns={columns}
          rows={rows} 
          selectedRows={selectedRows}
          onSelectedRowsChange={setSelectedRows}
          onRowsChange={setRows}
          rowGetter={i => rows[i]}
          rowKeyGetter={rowKeyGetter} 
          rowsCount={rows.length} 
          enableCellSelect={true}
        />
    </div>
  );
}


export { DeploymentManager };
