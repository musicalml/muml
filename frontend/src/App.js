import React, { Component } from 'react';

import Piano from './Piano';

import './App.css';

class App extends Component {
  render() {
    return (
      <div className={'piano_container'}>
        <Piano />
      </div>
    );
  }
}

export default App;
