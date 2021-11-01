//import React from 'react';
//import ReactDOM from 'react-dom';
'use strict';

/*
var connectForm = document.getElementById('connectForm');
var servers = document.getElementById('servers');
var messages = document.getElementById('messages');

var form = document.getElementById('form');
var input = document.getElementById('input');

connectForm.addEventListener('submit', function(e) {
  e.preventDefault();
  var connectReq = { 'request': 'connect', 'server': servers.value };
  console.log(`request: ${JSON.stringify(connectReq)}`)

  fetch('http://localhost:5000/connection', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(connectReq)
  })
  .then(res => {
      if (res.ok) {
          return res.json();
        } else {
          messages.value += '\n' + "Error response";
        }
      })
      .then(data => {
        console.log(data);
        messages.value += '\n' + JSON.stringify(data);
        window.scrollTo(0, document.body.scrollHeight);
  })
  .catch(error => {
    messages.value += '\n' + `Error ${error}`;
    console.log(`Error ${error}`);
  });
});
*/



const e = React.createElement;
/*
class ConnectButton extends React.Component {

}

class DisconnectButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = { disconnected: false };
  }

  render() {
    if (this.state.disconnected) {
      return 'You are disconnected.';
    }

    return e(
      'button',
      { onClick: () => this.setState({ disconnected: true }) },
      'Disconnect'
    );
  }
}
*/

/*
function ConnectDisconnectButton(props) {
  return (
    <button className="connect-disconnect" onClick={props.onClick}>
      {props.value}
    </button>
  );
}
*/

class ConnectDisconnectButton extends React.Component {
  render() {
    return (
      <button className="connect-disconnect" onClick={props.onClick}>
        {props.value}
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
    // TODO send message to node backend.
    this.setState({
      connected: connect,
    });
  }

  render() {
    return (
      <div className="connectionPanel">
        <ConnectDisconnectButton value="Connnect" onClick={() => this.handleConnectionClick(true)}/>
        <select name="servers" id="servers">
          <option value="192.168.1.142">192.168.1.142</option>
          <option value="127.0.0.1">127.0.0.1</option>
        </select>
        <ConnectDisconnectButton value="Disconnnect" onClick={() => this.handleConnectionClick(false)}/>
      </div>

      /*
      <div className="game">
        <div className="game-board">
          <Board squares={current.squares} onClick={(i) => this.handleClick(i)} />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
      */
    );
  }
}



const domContainer = document.querySelector('#connectbar');
ReactDOM.render(e(ControlPanel), domContainer);

