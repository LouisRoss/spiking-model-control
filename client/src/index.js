import React from 'react';
import ReactDOM from 'react-dom';
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

function StatusRequestResponse(callback) {
  var init = {
    method: 'GET',
  };
  RequestResponse('status', init, callback);
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
    console.log(data);
    //messages.value += '\n' + JSON.stringify(data);
    //window.scrollTo(0, document.body.scrollHeight);
    callback(data);
  })
  .catch(error => {
    messages.value += `\nError ${error}`;
    console.log(`Error ${error}`);
  });
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
    };

    this.statusPoll = this.statusPoll.bind(this);
    setInterval(this.statusPoll, 500);
  }
  
  statusPoll() {
    StatusRequestResponse((data) => {
      var status = document.getElementById('status');
      status.value = JSON.stringify(data);
      this.setState({ connected: data.status.connected });
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
                <textarea name="messages" id="messages" cols="120" rows="20" readOnly></textarea>
              </div>
              <textarea name="status" id="status" cols="120" rows="3" readOnly></textarea>
            </div>
          </div>
        </section>

        <section className="rightpane">
          <label htmlFor="">a</label>
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

