import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Tone from 'tone';

import PianoKeyboard from './PianoKeyboard';
import PianoMidiInput from './PianoMidiInput.js';
import {keysWithoutFakes} from './misc';


const isPressed = (button) => (Object.keys(button).some(
    (key) => (key !== 'key' && button[key] === true)));

/**
 * A main component for using the piano. It is responsible for handling midi
 * input and playing sounds. Uses PianoKeyboard for rendering the buttons.
 * @class Piano
 */
class Piano extends Component {
  /**
   * Default constructor.
   * @param {Object} props - the props.
   */
  constructor(props) {
    super(props);
    const keysToButtons = (key) => ({
      key: key,
    });
    this.state = {
      buttons: keysWithoutFakes.map(keysToButtons),
    };
    this.synth = new Tone.PolySynth(6, Tone.Synth).toMaster();
    //this.synth.set('detune', 200);
    this.pianoKeyMouseEvent = this.togglePianoKey.bind(this, 'mouse');
    this.pianoKeyMidiEvent = this.togglePianoKey.bind(this, 'midi');
    this.onMidiValueUpdate = this.onMidiValueUpdate.bind(this);
  }

  static propTypes = {
    onPianoKeyEvent: PropTypes.func,
    highlightKeys: PropTypes.array,
  };

  /**
   * Marks a piano key as being pressed or depressed and triggers
   * onPianoKeyEvent if required.
   * @param {String} type - type of press (midi or mouse)
   * @param {String} key - the key in musical notation
   * @param {Boolean} active - whether the key is pressed or depressed
   * @function togglePianoKey
   */
  togglePianoKey(type, key, active) {
    const otherButtons = this.state.buttons
        .filter((button)=>(button.key!==key));
    const button = this.state.buttons.find((button) => (button.key === key));
    const newButton = Object.assign({}, button);
    newButton[type] = active;
    const oldState = isPressed(button);
    const newState = isPressed(newButton);

    if (newState !== oldState) {
      this.onPianoKeyEvent(key, newState);
    }

    this.setState({
      ...this.state,
      buttons: [
        ...otherButtons,
        newButton,
      ],
    });
  }

  /**
   * Actions to be done when a key is pressed/released in any way.
   * @param {String} key - the key in musical notation
   * @param {Boolean} active - whether the key is pressed or depressed.
   */
  onPianoKeyEvent(key, active) {
    if (active) {
      this.synth.triggerAttack(key);
    } else {
      this.synth.triggerRelease(key);
    }
    if (this.props.onPianoKeyEvent) {
      this.props.onPianoKeyEvent(key, active);
    }
  }

  /**
   * Callback for midi input when some knob is turned.
   * @param {String} key - the key of the synth being changed
   * @param {Number} value - the new value
   */
  onMidiValueUpdate(key, value) {
    this.synth.set(key, value);
  }

  /**
   * Renders the piano with correct pressed/depressed keys.
   * @return {React.Node} - rendered piano.
   */
  render() {
    const pressedKeys = this.state.buttons
        .filter(isPressed)
        .map((button)=>(button.key));

    return (
      <div style={{height: '100%'}}>
        <PianoKeyboard
          highlightKeys={this.props.highlightKeys}
          pressedKeys={pressedKeys}
          onMouseEvent={this.pianoKeyMouseEvent}
        />
        <PianoMidiInput
          onMidiKeyEvent={this.pianoKeyMidiEvent}
          onMidiValueUpdate={this.onMidiValueUpdate}
        />
      </div>
    );
  }
}

export default Piano;
