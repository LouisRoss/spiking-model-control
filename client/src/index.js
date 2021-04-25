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
   
class ConnectDisconnectButton extends React.Component {
  render() {
    return (
      <button id="connectButton" className="connect-disconnect" onClick={this.props.onClick}>
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
  }
  
  handleConnectionClick(connect) {
    var servers = document.getElementById('servers');
    var messages = document.getElementById('messages');

    let connectReq;
    if (connect) {
      connectReq = { 'request': 'connect', 'server': servers.value };
    } else {
      connectReq = { 'request': 'disconnect', 'server': '' };
    }
    console.log(`request: ${JSON.stringify(connectReq)}`)
    
    fetch('http://localhost:5000/connection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(connectReq)
    })
    .then(res => {
      if (res.ok) {
        return res.json();
      } else {
        messages.value += "\nError response";
      }
    })
    .then(data => {
      console.log(data);
      messages.value += '\n' + JSON.stringify(data);
      window.scrollTo(0, document.body.scrollHeight);
    })
    .catch(error => {
      messages.value += `\nError ${error}`;
      console.log(`Error ${error}`);
    });
  
    // TODO send message to node backend.
    console.log(`Connected: ${connect}`)
    this.setState({
      connected: connect,
    });
  }

  render() {
    return (
      <div className="mainbody">
        <section className="leftpane">
        <div className="connectbar">
          <div className="connectionPanel">
            <ConnectDisconnectButton value="Connnect" onClick={() => this.handleConnectionClick(true)}/>
            <select name="servers" id="servers">
              <option value="192.168.1.142">192.168.1.142</option>
              <option value="127.0.0.1">127.0.0.1</option>
            </select>
            <ConnectDisconnectButton value="Disconnnect" onClick={() => this.handleConnectionClick(false)}/>
          </div>

          <div className="messagebar">
            <div className="messages">
              <textarea name="messages" id="messages" cols="120" rows="20" readOnly></textarea>
            </div>
          </div>
          </div>
        </section>

        <section className="rightpane">
          <label htmlFor="">a</label>
        </section>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
    <ControlPanel />,
    document.getElementById('root')
  );

