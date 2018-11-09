import React, {Component} from 'react';
import {Nav, Navbar, NavItem} from 'react-bootstrap';
import {BrowserRouter, Route, Redirect} from 'react-router-dom';

import TrackSelectionScreen from 'Screens/TrackSelectionScreen';
import TrackScreen from 'Screens/TrackScreen';

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
      <BrowserRouter>
        <div className={'app'}>
          <Navbar>
            <Navbar.Header>
              <Navbar.Brand>
                <a href="/">MUML</a>
              </Navbar.Brand>
            </Navbar.Header>
            <Nav>
              <NavItem eventKey={1} href="/tracks">
                Tracks
              </NavItem>
              <NavItem eventKey={2} href="/play">
                Play
              </NavItem>
            </Nav>
          </Navbar>
          <div className={'screen_container'}>
            <Route exact path='/' component={()=>(<Redirect to='/tracks' />)}/>
            <Route path='/tracks' component={TrackSelectionScreen}/>
            <Route path='/play/:trackId' component={TrackScreen}/>
          </div>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
