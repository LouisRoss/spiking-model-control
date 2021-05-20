import React, { Component } from 'react';
import Switch from "react-switch";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import ReactDOM from 'react-dom';
import '@fontsource/roboto';
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


const baseURL = 'http://localhost:5000/';

function ConnectionRequestResponse(request, callback) {
  var init = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', },
    body: JSON.stringify(request)
  };
  RequestResponse('connection', init, callback);
}

function ConfigurationsRequestResponse(callback) {
  var init = {
    method: 'GET',
  };
  RequestResponse('configurations', init, callback);
}

function StatusRequestResponse(callback) {
  var init = {
    method: 'GET',
  };
  RequestResponse('status', init, callback);
}
/*
function FullStatusRequestResponse(callback) {
  var init = {
    method: 'GET',
  };
  RequestResponse('fullstatus', init, callback);
}
*/
function PassthroughRequestResponse(request, callback) {
  var init = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', },
    body: JSON.stringify(request)
  };
  RequestResponse('passthrough', init, callback);
}

function RequestResponse(resource, init, callback) {
  var messages = document.getElementById('messages');
  
  if (init.body) {
    console.log(`request: ${init.body}`)
  }
  
  fetch(baseURL + resource, init)
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

class PropertySelect extends Component {
  render() {
    return (
      <Select
        className="control select"
        defaultValue={this.props.currentValue()}
        options={this.props.options}
        onChange = {this.props.setValue}
        value={this.props.currentValue()}
      />
    );
  }
}

const loadOptions = (inputValue, callback) => {
  console.log('Loading options...');
  ConfigurationsRequestResponse((data) => {
    console.log(`Received configurations ${JSON.stringify(data)}`);
    callback([
      { value: 'a1', label: 'a1' },
      { value: 'l1', label: 'l1' },
      { value: 'bmtk1', label: 'bmtk2' }
    ]);
  });
}

const loadOptions2 = inputValue => 
new Promise(resolve => {
  ConfigurationsRequestResponse((data) => {
    console.log(`Received configurations ${JSON.stringify(data)}`);
    if (typeof data.result === 'undefined' || data.result !== 'ok') {
      if (typeof data.error !== 'undefined' && data.error != null && typeof data.errordetail !== 'undefined') {
        var status = document.getElementById('status');
        status.value = `Error: ${data.error} - ${data.errordetail}`
        }
        resolve([]);
      }
      else {
        var options = [];
        data.options.configurations.forEach(option => {
          options.push({value: option, label: option});
        })
       resolve(options);
      }
    });
  });

class AsyncConfigurationsSelect extends Component {
  render() {
    return (
      <AsyncSelect
        className="control select"
        cacheOptions
        loadOptions={loadOptions2}
        defaultOptions={[]}
      />
    );
  }
}

class PropertySwitch extends Component {
  render() {
    return (
        <label className="property-switch" htmlFor="material-switch">
          <span className="control-label">{this.props.value}</span>
          <Switch
            checked={this.props.isChecked()}
            onChange={this.props.onChange}
            onColor="#86d3ff"
            onHandleColor="#2693e6"
            uncheckedIcon={false}
            checkedIcon={false}
            boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
            activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
            height={20}
            width={36}
            className="react-switch control"
            id="material-switch"
          />
        </label>
    );
  }
}


class ConnectDisconnectButton extends React.Component {
  render() {
    return (
      <button 
        id="connectButton" 
        className="connect-disconnect" 
        disabled={this.props.disabled()} 
        style={{opacity: (this.props.disabled()? 0.3 : 1.0)}}
        onClick={this.props.onClick}>
          {this.props.value}
      </button>
    );
  }
}




class ControlPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      connected: false,
      running: false,
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
    };

    this.statusPoll = this.statusPoll.bind(this);
    setInterval(this.statusPoll, 500);
  }
  
  distributStatusResonse(data) {
    var status = document.getElementById('status');
    //status.value = JSON.stringify(data);
    
    if (typeof data.status !== 'undefined')
    {
      if (typeof data.status.run          !== 'undefined') { this.setState({ running: data.status.run }); }
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
    }

    if (typeof data.error !== 'undefined' && data.error != null && typeof data.errordetail !== 'undefined') {
      status.value = `Error: ${data.error} - ${data.errordetail}`
    }
  }
  
  statusPoll() {
    StatusRequestResponse((data) => {
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

    ConnectionRequestResponse(connectReq, (data) => {
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

    PassthroughRequestResponse(switchChangeReq, (data) => {
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
                <textarea name="messages" id="messages" cols="120" rows="30" readOnly></textarea>
                <textarea name="status" id="status" cols="120" rows="5" readOnly></textarea>
              </div>
            </div>
          </div>
        </section>

        <section className="rightpane">
          <PropertySwitch onChange={(checked) => this.sendSwitchChangeCommand({ run: checked })} isChecked={() => this.state.running} value="Running" />

          
          <div className="property-switch">
            <span className="control-label">Configurations</span>
            <AsyncConfigurationsSelect setValue = {value => this.sendSwitchChangeCommand({ loglevel: value.value })}/>
          </div>


          <div className="property-switch">
            <span className="control-label">Engine Init</span>
            <span className="control">{this.state.engineinit ? 'true' : 'false'}</span>
          </div>
          <div className="property-switch">
            <span className="control-label">Engine Fail</span>
            <span className="control">{this.state.enginefail ? 'true' : 'false'}</span>
          </div>

          <hr />

          <PropertySwitch onChange={(checked) => this.sendSwitchChangeCommand({ logenable: checked })} isChecked={() => this.state.logging} value="Logging" />
          <div className="property-switch">
            <span className="control-label">Log File</span>
            <span className="control">{this.state.logfile}</span>
          </div>
          <div className="property-switch">
            <span className="control-label">Logging Level</span>
            <PropertySelect options = {logLevels} currentValue = {() => logLevels[this.state.loglevel]} setValue = {value => this.sendSwitchChangeCommand({ loglevel: value.value })}/>
          </div>

          <hr />

          <PropertySwitch onChange={(checked) => this.sendSwitchChangeCommand({ recordenable: checked })} isChecked={() => this.state.recording} value="Recording" />
          <div className="property-switch">
            <span className="control-label">Record File</span>
            <span className="control">{this.state.recordfile}</span>
          </div>
          <div className="property-switch">
          <span className="control-label">Engine Period</span>
            <PropertySelect options = {enginePeriods} currentValue = {() => this.getEnginePeriod()} setValue = {value => this.sendSwitchChangeCommand({ engineperiod: value.value })}/>
          </div>

          <hr />

          <div className="property-switch">
            <span className="control-label">Iterations</span>
            <span className="control">{this.state.iterations}</span>
          </div>
          <div className="property-switch">
            <span className="control-label">Total Work</span>
            <span className="control">{this.state.totalwork}</span>
          </div>
        </section>
      </section>
    );
  }
}

// ========================================

ReactDOM.render(
    <ControlPanel />,
    document.getElementById('root')
  );

