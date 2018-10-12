import React, {Component} from 'react';

import Piano from './Piano';

import './App.css';

/**
 * The primary application class.
 * @class App
 */
class App extends Component {
  /**
   * @return {React.Node} - The rendered application
   * @method render
   */
  render() {
    return (
      <div className={'piano_container'}>
        <Piano />
      </div>
    );
  }
}

export default App;
