import React, {Component} from 'react';
import {Button, Form, FormGroup, FormControl, Badge} from 'react-bootstrap';
import icon from './icon.jpg';
import {loadMidi} from '../Api';

/**
 * A track info screen with controls to listen to/play a song
 */
class AdminScreen extends Component {
  /**
   * Default constructor
   * @param {Object} props - the props.
   */
  constructor(props) {
    super(props);
    this.fileUpload = null;

    this.name = React.createRef();
    this.file = null;
    this.loadFile = this.loadFile.bind(this);
    this.sendFile = this.sendFile.bind(this);
    this.getLoadMidiForm = this.getLoadMidiForm.bind(this);
  };

  /**
   * Loads file into memory
   * @param {Event} event  file upload event
   */
  loadFile(event) {
    this.file = event.target.files[0];
  }

  /**
   * Sends midi to mu backend
   */
  sendFile() {
    if (this.file !== null) {
      let response = loadMidi(this.file, this.name.value);
      console.log('STATUS', response);
    } else {
      console.log('No file chosen');
    }
  }

  /**
   * JSX form for loading midi
   * @return {React.Node} Midi loader form
   */
  getLoadMidiForm() {
    return (<Form>
      <FormGroup controlId="midName">
        <Badge>Midi name</Badge>
        <FormControl type="text" inputRef={(ref) => {
          this.name = ref;
        }} placeholder="Enter midi name"/>
      </FormGroup>
      <FormGroup>
        <Badge>Add midi</Badge>
        <input type="file" accept=".mid" onChange={this.loadFile}/>
      </FormGroup>
      <Button variant="primary" onClick={this.sendFile}>Submit</ Button>
    </Form>);
  }

  /**
   * Renders the screen.
   * @return {React.Node} - the rendered screen.
   */
  render() {
    return (
      <div>
        <img src={icon} width="300" height="170"/>
        {this.getLoadMidiForm()}
      </div>
    );
  }
};

export default AdminScreen;
