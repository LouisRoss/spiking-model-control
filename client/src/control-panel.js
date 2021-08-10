import { Component } from 'react';
import history from './history.js';
import { RestManager } from "./rest-manager";
import { Button } from 'react-bootstrap';
import { PropertySelect, AsyncConfigurationsSelect } from "./property-select.js";
import { PropertySwitch, ConnectDisconnectButton } from "./property-switch.js";
import ReactDOM from 'react-dom';
import { LineChart } from './line-chart.js'
import './App.css';

 /*
 function ConnectDisconnectButton(props) {
  return (
    <button id="connectButton" className="connect-disconnect" onClick={props.onClick}>
      {props.value}
    </button>
  );
}
*/

var restManager = RestManager.getInstance();

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

class ControlPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      connected: false,
      running: false,
      pause: false,
      recording: false,
      logging: false,
      engineinit: false,
      enginefail: false,
      engineperiod: 0,
      iterations: 0,
      logfile: '',
      recordfile: '',
      loglevel: 0,
      totalwork: 0,
      cpu: 0,
      cpuhistory: []
    };

    for (let i = 0; i < 200; i++) {
      this.state.cpuhistory.push(0);
    }

    this.statusPoll = this.statusPoll.bind(this);
    this.timerId = setInterval(this.statusPoll, 500);
  }

  componentWillUnmount() {
    clearInterval(this.timerId);
  }
  
  distributStatusResonse(data) {
    var status = document.getElementById('status');
    //status.value = JSON.stringify(data);
    
    if (typeof data.status !== 'undefined')
    {
      if (typeof data.status.run          !== 'undefined') { this.setState({ running: data.status.run }); }
      if (typeof data.status.pause        !== 'undefined') { this.setState({ pause: data.status.pause }); }
      if (typeof data.status.controlfile  !== 'undefined') { this.setState({ controlfile: data.status.controlfile }); }
      if (typeof data.status.recordenable !== 'undefined') { this.setState({ recording: data.status.recordenable }); }
      if (typeof data.status.logenable    !== 'undefined') { this.setState({ logging: data.status.logenable }); }
      if (typeof data.status.enginefail   !== 'undefined') { this.setState({ enginefail: data.status.enginefail }); }
      if (typeof data.status.engineinit   !== 'undefined') { this.setState({ engineinit: data.status.engineinit }); }
      if (typeof data.status.engineperiod !== 'undefined') { this.setState({ engineperiod: data.status.engineperiod }); }
      if (typeof data.status.iterations   !== 'undefined') { this.setState({ iterations: data.status.iterations }); }
      if (typeof data.status.logfile      !== 'undefined') { this.setState({ logfile: data.status.logfile }); }
      if (typeof data.status.loglevel     !== 'undefined') { this.setState({ loglevel: data.status.loglevel }); }
      if (typeof data.status.recordfile   !== 'undefined') { this.setState({ recordfile: data.status.recordfile }); }
      if (typeof data.status.totalwork    !== 'undefined') { this.setState({ totalwork: data.status.totalwork }); }
      if (typeof data.status.cpu          !== 'undefined') { this.setState({ cpu: data.status.cpu }); }
      if (typeof data.status.cpuhistory   !== 'undefined') { this.setState({ cpuhistory: data.status.cpuhistory }); }
    }

    if (typeof data.error !== 'undefined' && data.error != null && typeof data.errordetail !== 'undefined') {
      status.value = `Error: ${data.error} - ${data.errordetail}`
    }
  }
  
  statusPoll() {
    restManager.StatusRequestResponse((data) => {
      this.setState({ connected: data.response.status.connected });
      this.distributStatusResonse(data.response)
    });
  }

  handleConnectionClick(connect) {
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

  getEnginePeriod() {
    let result = enginePeriods[2];
    let found = false;
    
    enginePeriods.forEach((value) => {
      if (!found && this.state.engineperiod <= value.value) {
        result = value;
        found = true;
      }
    });
    
    //console.log(`getEnginePeriod returning ${JSON.stringify(result)}`)
    return result;
  }

  sendSwitchChangeCommand(values) {
    var switchChangeReq = { request: 'passthrough', packet: { query: 'control', values: values } };

    restManager.PassthroughRequestResponse(switchChangeReq, (data) => {
      console.log(`Switch change response: ${JSON.stringify(data)}`);
      this.distributStatusResonse(data);
    });  
  }  

  
  render() {
    return (
      <section className="mainbody">
        <section className="leftpane">
          <div className="connectbar">
            <div id="connectionPanel">
              <ConnectDisconnectButton value="Connnect" disabled={() => this.state.connected} onClick={() => this.handleConnectionClick(true)}/>
              <select name="servers" id="servers">
                <option value="192.168.1.142">192.168.1.142</option>
                <option value="127.0.0.1">127.0.0.1</option>
              </select>
              <ConnectDisconnectButton value="Disconnnect" disabled={() => !this.state.connected} onClick={() => this.handleConnectionClick(false)}/>
            </div>

            <div className="messagebar">
              <div className="messages">
                <textarea name="messages" id="messages" cols="120" rows="15" readOnly></textarea>
                <textarea name="status" id="status" cols="120" rows="5" readOnly></textarea>
              </div>
            </div>

            <div className="stripchartbar">
              <div className="header">% CPU</div>
              <LineChart svgHeight="40" svgWidth="400" data={this.state.cpuhistory} color='#333333' />
            </div>

          </div>
        </section>

        <section className="rightpane">
          <PropertySwitch onChange={(checked) => this.sendSwitchChangeCommand({ run: checked })} isChecked={() => this.state.running} value={'Running'} label={this.state.controlfile} connected={this.state.connected} />
          
          <div className="property-switch">
            <span className="control-label">Configurations</span>
            <AsyncConfigurationsSelect setValue = {value => this.sendSwitchChangeCommand({ run: true, configuration: value.value })} connected={this.state.connected} />
          </div>

          <PropertySwitch onChange={(checked) => this.sendSwitchChangeCommand({ pause: checked })} isChecked={() => this.state.pause} value={'Paused'} label='' connected={this.state.connected} />

          <div className="property-switch">
            <span className="control-label">Engine Init</span>
            <span className="control">{this.state.engineinit ? 'true' : 'false'}</span>
          </div>
          <div className="property-switch">
            <span className="control-label">Engine Fail</span>
            <span className="control">{this.state.enginefail ? 'true' : 'false'}</span>
          </div>

          <hr />

          <PropertySwitch onChange={(checked) => this.sendSwitchChangeCommand({ logenable: checked })} isChecked={() => this.state.logging} value="Logging" label='' connected={this.state.connected} />
          <div className="property-switch">
            <span className="control-label">Log File</span>
            <span className="control-value">{this.state.logfile}</span>
          </div>
          <div className="property-switch">
            <span className="control-label">Logging Level</span>
            <PropertySelect options = {logLevels} currentValue = {() => logLevels[this.state.loglevel]} setValue = {value => this.sendSwitchChangeCommand({ loglevel: value.value })} connected={this.state.connected} />
          </div>

          <hr />

          <PropertySwitch onChange={(checked) => this.sendSwitchChangeCommand({ recordenable: checked })} isChecked={() => this.state.recording} value="Recording"  label='' connected={this.state.connected} />
          <div className="property-switch">
            <span className="control-label">Record File</span>
            <span className="control-value">{this.state.recordfile}</span>
          </div>
          <div className="property-switch">
          <span className="control-label">Engine Period</span>
            <PropertySelect options = {enginePeriods} currentValue = {() => this.getEnginePeriod()} setValue = {value => this.sendSwitchChangeCommand({ engineperiod: value.value })} connected={this.state.connected} />
          </div>

          <hr />

          <div className="property-switch">
            <span className="control-label">Iterations</span>
            <span className="control">{Number(this.state.iterations).toLocaleString('en', {useGrouping:true})}</span>
          </div>
          <div className="property-switch">
            <span className="control-label">Total Work</span>
            <span className="control">{this.state.totalwork}</span>
          </div>
          <div className="property-switch">
            <span className="control-label">CPU %</span>
            <span className="control">{(this.state.cpu * 100).toFixed(2)}</span>
          </div>
          <form>
            <Button variant="btn btn-success" onClick={() => history.push('/')}>Model Selector</Button>
            <Button variant="btn btn-success" onClick={() => history.push('/ControlPanel')}>Control Panel</Button>
          </form>
        </section>
      </section>
    );
  }
}

export { ControlPanel };
