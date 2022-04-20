import { useRef, useState, useEffect, useCallback } from 'react';
import { PropertySelect, AsyncConfigurationsSelect } from "./property-select.js";
import { PropertySwitch } from "./property-switch.js";
import './App.css';
import configuration from './configfiles/configuration.json';

const baseControlConnectorWsUrl = configuration.services.controlConnector.host + ':' + configuration.services.controlConnector.wsport;

const logLevels = [
  { value: 0, label: 'None' },
  { value: 1, label: 'Status' },
  { value: 2, label: 'Diagnostic' },
];
  
const enginePeriods = [
  { value: 0, label: 'Unknown' },
  { value: 100, label: '0.1 ms' },
  { value: 200, label: '0.2 ms' },
  { value: 500, label: '0.5 ms' },
  { value: 1000, label: '1.0 ms' },
  { value: 2000, label: '2.0 ms' },
  { value: 5000, label: '5.0 ms' },
  { value: 10000, label: '10 ms' },
  { value: 20000, label: '20 ms' },
  { value: 50000, label: '50 ms' },
  { value: 100000, label: '100 ms' },
  { value: 200000, label: '200 ms' },
  { value: 500000, label: '500 ms' },
  { value: 1000000, label: '1 s' },
  { value: 2000000, label: '2 s' },
  { value: 5000000, label: '5 s' },
];

// The exported component.
const StatusAndControlPanel = ({ restManager, handleCpuHistory, engine }) => {
  const [engineStatus, setEngineStatus] = useState({ 
    connected: false, 
    run: false,
    pause: false,
    controlfile: '',
    recordenable: false,
    recordsynapses: false,
    logenable: false,
    engineinit: false,
    enginefail: false,
    engineperiod: 0,
    iterations: 0,
    logfile: '',
    recordfile: '',
    loglevel: 0,
    totalwork: 0,
    cpu: 0
  });

  const socket = useRef(null);

  // NOTE - The linter recommends setting dependencies on engineStatus and
  //        handleCpuHistory, but doing so causes an infinite tight loop.
  //        Not doing that.
  useEffect(() => {
    socket.current = new WebSocket('ws://' + baseControlConnectorWsUrl);
    socket.current.onopen = function () {
      console.log(`Opened websocket with ws://${baseControlConnectorWsUrl}`);
    };

    socket.current.onmessage = function (message) {
      //console.log(`Received websocket message ${message.data}`);
      const data = JSON.parse(message.data);
      setEngineStatus({...engineStatus, ...data});
      handleCpuHistory(data.cpuhistory);
      //console.log(engineStatus);
    };

    socket.current.onerror = function (error) {
        console.log('WebSocket error: ' + error);
    };
  }, []);


  const memoizedDistributStatusResonse = useCallback((data) => {
    if (typeof data.status !== 'undefined')
    {
      setEngineStatus({...engineStatus, ...data.status});
      //console.log(engineStatus);
    }
  }, [engineStatus]);

//  useEffect(() => {
//    registerUpdateFunc(memoizedDistributStatusResonse);
//  }, [registerUpdateFunc, memoizedDistributStatusResonse]);

  const sendSwitchChangeCommand = (values) => {
    var switchChangeReq = { query: 'control', values: values };

    restManager.PassthroughRequestResponse(engine, switchChangeReq, (data) => {
      console.log(`Switch change response: ${JSON.stringify(data)}`);
      memoizedDistributStatusResonse(data);
    });  
  }  

  const getEnginePeriod = () => {
    let result = enginePeriods[2];
    let found = false;
    
    enginePeriods.forEach((value) => {
      if (!found && engineStatus.engineperiod <= value.value) {
        result = value;
        found = true;
      }
    });
    
    //console.log(`getEnginePeriod returning ${JSON.stringify(result)}`)
    return result;
  }


  return (
    <section className="rightpane">
      <PropertySwitch onChange={(checked) => sendSwitchChangeCommand({ run: checked })} isChecked={() => engineStatus.run} value={'Running'} label={engineStatus.controlfile} connected={engineStatus.connected} />
      
      <div className="property-switch">
        <span className="control-label">Configurations</span>
        <AsyncConfigurationsSelect setValue = {value => sendSwitchChangeCommand({ run: true, configuration: value.value })} connected={engineStatus.connected} />
      </div>

      <PropertySwitch onChange={(checked) => sendSwitchChangeCommand({ pause: checked })} isChecked={() => engineStatus.pause} value={'Paused'} label='' connected={engineStatus.connected} />

      <div className="property-switch">
        <span className="control-label">Engine Init</span>
        <span className="control">{engineStatus.engineinit ? 'true' : 'false'}</span>
      </div>
      <div className="property-switch">
        <span className="control-label">Engine Fail</span>
        <span className="control">{engineStatus.enginefail ? 'true' : 'false'}</span>
      </div>

      <hr />

      <PropertySwitch onChange={(checked) => sendSwitchChangeCommand({ logenable: checked })} isChecked={() => engineStatus.logenable} value="Logging" label='' connected={engineStatus.connected} />
      <div className="property-switch">
        <span className="control-label">Log File</span>
        <span className="control-value">{engineStatus.logfile}</span>
      </div>
      <div className="property-switch">
        <span className="control-label">Logging Level</span>
        <PropertySelect options = {logLevels} currentValue = {() => logLevels[engineStatus.loglevel]} setValue = {value => sendSwitchChangeCommand({ loglevel: value.value })} connected={engineStatus.connected} />
      </div>

      <hr />

      <PropertySwitch onChange={(checked) => sendSwitchChangeCommand(checked ? { recordenable: true } : { recordenable: false, recordsynapses: false })} isChecked={() => engineStatus.recordenable} value="Recording"  label='' connected={engineStatus.connected} />
      <PropertySwitch onChange={(checked) => sendSwitchChangeCommand({ recordsynapses: checked })} isChecked={() => engineStatus.recordsynapses} value="Record Synapses"  label='' connected={engineStatus.connected && engineStatus.recordenable} />
      <div className="property-switch">
        <span className="control-label">Record File</span>
        <span className="control-value">{engineStatus.recordfile}</span>
      </div>
      <div className="property-switch">
        <span className="control-label">Engine Period</span>
        <PropertySelect options = {enginePeriods} currentValue = {() => getEnginePeriod()} setValue = {value => sendSwitchChangeCommand({ engineperiod: value.value })} connected={engineStatus.connected} />
      </div>

      <hr />

      <div className="property-switch">
        <span className="control-label">Iterations</span>
        <span className="control">{Number(engineStatus.iterations).toLocaleString('en', {useGrouping:true})}</span>
      </div>
      <div className="property-switch">
        <span className="control-label">Total Work</span>
        <span className="control">{engineStatus.totalwork}</span>
      </div>
      <div className="property-switch">
        <span className="control-label">CPU %</span>
        <span className="control">{(engineStatus.cpu * 100).toFixed(2)}</span>
      </div>
    </section>
  );
}


export { StatusAndControlPanel };
