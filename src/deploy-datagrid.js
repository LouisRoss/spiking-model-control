import { useState, useMemo } from 'react';
import ReactDataGrid, { TextEditor } from "react-data-grid";
import './App.css';
import './deployment-manager.css';

// TODO - read from configuration file.
const engineServers = [
  { id: 'reserach1', value: 'Research1' },
  { id: 'sensor1', value: 'Sensor1' },
  { id: 'sensor2', value: 'Sensor2' },
  { id: 'responder1', value: 'Responder1' }
];

// TODO -read from packager.
const rowValues = [
  { id: 0, population: 'connected', template: 'ten-by-ten', engine: 'Research1' },
  { id: 1, population: 'reducer1', template: 'five-by-five', engine: 'Sensor1' },
  { id: 2, population: 'reducer2', template: 'five-by-five', engine: 'Sensor2' },
  { id: 3, population: 'output', template: 'ten-by-ten', engine: 'Responder1' }
];

function getColumns(engineServers) {
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
          onChange={(e) => { p.onRowChange({ ...p.row, engine: e.target.value }, true) }}
        >
          {engineServers.map((engine) => (
            <option key={engine.id}>{engine.value}</option>
          ))}
        </select>
      ),
      editorOptions: {
        editOnClick: true
      }
    }
  ];
}


const DeploymentManager = ({selectedModel}) => {
  const [rows, setRows] = useState(rowValues);
  const [selectedRows, setSelectedRows] = useState(() => new Set());
/*
  const onGridRowsUpdated = ({ fromRow, toRow, updated }) => {
    const localRows = rows.slice();
    for (let i = fromRow; i <= toRow; i++) {
      localRows[i] = { ...localRows[i], ...updated };
    }
    setRows(localRows);
  };
*/
  const columns = useMemo(() => getColumns(engineServers), [engineServers]);

  const rowKeyGetter = (row) => {
    return row.id;
  }
  
  //  onGridRowsUpdated={onGridRowsUpdated}
  //  rowGetter={i => rows[i]} 


  return (
    <div className="deployment-manager">
      <ReactDataGrid
        columns={columns}
        rows={rows} 
        selectedRows={selectedRows}
        onSelectedRowsChange={setSelectedRows}
        onRowsChange={setRows}
        rowKeyGetter={rowKeyGetter} 
        rowsCount={4} 
        enableCellSelect={true}
      />
    </div>
  );
}


export { DeploymentManager };
