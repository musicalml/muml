import React, {Component} from 'react';
import {Nav, Navbar, NavItem} from 'react-bootstrap';
import {BrowserRouter, Route, Redirect} from 'react-router-dom';

import TrackSelectionScreen from 'Screens/TrackSelectionScreen';
import LearningScreen from 'Screens/LearningScreen';
import FreePlayScreen from 'Screens/FreePlayScreen';
import TrackScreen from 'Screens/TrackScreen';
import ListenScreen from 'Screens/ListenScreen';
import AdminScreen from 'Screens/AdminScreen';

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
          <Navbar bg="dark" variant="dark" fixed="top" sticky="top">
            <Navbar.Brand href="/">
              MUML
            </Navbar.Brand>
            <Nav>
              <Nav.Link href="/tracks">Tracks</Nav.Link>
              <Nav.Link href="/play">Free play</Nav.Link>
            </Nav>
          </Navbar>
          <div className={'screen_container'}>
            <Route exact path='/' component={()=>(<Redirect to='/tracks' />)}/>
            <Route exact path='/tracks' component={TrackSelectionScreen}/>
            <Route exact path='/tracks/:trackId' component={TrackScreen}/>
            <Route path='/play/:trackId' component={LearningScreen}/>
            <Route path='/listen/:trackId' component={ListenScreen}/>
            <Route exact path='/play' component={FreePlayScreen}/>
            <Route exact path='/admin_page' component={AdminScreen}/>
          </div>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
