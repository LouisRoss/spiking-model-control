import { Component } from 'react';
import { RestManager } from "./rest-manager";
import { StatusAndControlPanel } from './status-control.js';
import { ConnectDisconnectButton } from './property-switch.js';
import { LineChart } from './line-chart.js'
import { DeploymentManager } from './deploy-datagrid.js';
import './App.css';

var restManager = RestManager.getInstance();

class ControlPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
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
    
    if (typeof data.error !== 'undefined' && data.error != null && typeof data.errordetail !== 'undefined') {
      status.value = `Error: ${data.error} - ${data.errordetail}`
    }
  }

  handleStatusControlUpdate = (engineStatus) => null;
  handleCpuChartUpdate = (cpuhistory) => null;

  statusPoll() {
    restManager.StatusRequestResponse((data) => {
      this.setState({ connected: data.response.status.connected });
      this.distributStatusResonse(data.response)
      if (this.handleStatusControlUpdate) {
        this.handleStatusControlUpdate(data.response);
      }

      if (this.handleCpuChartUpdate) {
        this.handleCpuChartUpdate(data.response.status.cpuhistory);
      }
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

  
  render() {
    return (
      <section className="mainbody">
        <section className="toppane">
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

              <div className="workingpanel">
                <div className="statuspanel">
                  <DeploymentManager />
                  <div className="messages">
                    <textarea name="messages" id="messages" cols="120" rows="12" readOnly></textarea>
                    <textarea name="status" id="status" cols="120" rows="5" readOnly></textarea>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <StatusAndControlPanel restManager={restManager} registerUpdateFunc = {(updateHandler) => this.handleStatusControlUpdate = updateHandler} />
        </section>
        <div className="stripchartbar">
          <div className="header">% CPU</div>
          <LineChart svgHeight="40" svgWidth="400" data={this.state.cpuhistory} color='#333333' registerUpdateFunc = {(updateHandler) => this.handleCpuChartUpdate = updateHandler} />
        </div>
      </section>
    );
  }
}

export { ControlPanel };
