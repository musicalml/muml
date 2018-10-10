import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import 'jzz';

const onMidiMessage = (message) => {
  if (message.data.length === 1 && message.data[0] === 254) {
    return;
  }
  console.log(message.data);
};

const onMidiSuccess = (midiAccess) => {
  const inputs = midiAccess.inputs;
  inputs.forEach((input) => {
    input.onmidimessage = onMidiMessage;
  });
};

class App extends Component {
  componentDidMount() {
    navigator.requestMIDIAccess().then(onMidiSuccess, console.log);
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    );
  }
}

export default App;
