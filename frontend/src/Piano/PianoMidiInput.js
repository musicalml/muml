import React, {Component} from 'react';
import PropTypes from 'prop-types';
import 'jzz';

import {midiCodeToKey} from './misc';

/**
 * A virtual component that is responsible for handling MIDI inputs.
 * @class PianoMidiInput
 */
class PianoMidiInput extends Component {
  /**
   * Default constructor.
   */
  constructor() {
    super();
    this.onMidiSuccess = this.onMidiSuccess.bind(this);
    this.onMidiMessage = this.onMidiMessage.bind(this);
  }

  static propTypes = {
    onMidiKeyEvent: PropTypes.func,
    onMidiValueUpdate: PropTypes.func,
  };

  /**
   * A callback for midi messages
   * @param {MidiMessage} message - the midi message
   */
  onMidiMessage(message) {
    const length = message.data.length;
    const code = message.data[0];
    const key = length > 1 ? message.data[1] : undefined;
    const velocity = length > 2 ? message.data[2] : undefined;

    if (length === 1 && code === 254) {
      return;
    }

    if (length === 3) {
      if (code === 144 && velocity > 0) { // note on
        this.pianoKeyMidiEvent(key, true);
      } else if (code === 128 || // note off
                (code === 144 && velocity === 0)) {
        this.pianoKeyMidiEvent(key, false);
      } else if (code === 176) {
        const value = (velocity - 64) * 3000 / 64;
        if (this.props.onMidiValueUpdate) {
          this.props.onMidiValueUpdate('detune', value);
        }
      } else {
        console.log(message.data);
      }
    } else {
      console.log(message.data);
    }
  }

  /**
   * A callback for noteOn/noteOff event on midi keyboard buttons.
   * @param {Integer} midiCode - the midi key code.
   * @param {Boolean} active - whether the key is pressed or depressed.
   */
  pianoKeyMidiEvent(midiCode, active) {
    const key = midiCodeToKey(midiCode);
    if (key === null) {
      return;
    }
    if (this.props.onMidiKeyEvent) {
      this.props.onMidiKeyEvent(key, active);
    }
  }

  /**
   * A callback for successful midi access request.
   * @param {MidiAccess} midiAccess - the access object containing inputs/outs
   */
  onMidiSuccess(midiAccess) {
    const inputs = midiAccess.inputs;
    inputs.forEach((input) => {
      input.onmidimessage = this.onMidiMessage;
    });
  };

  /**
   * A callback when the component is ready to do things. Used to request midi
   * access.
   */
  componentDidMount() {
    navigator.requestMIDIAccess().then(this.onMidiSuccess, console.log);
  }

  /**
   * This component is virtual, so it doesn't render anything.
   * @return {React.Node} - an empty node.
   */
  render() {
    return null;
  }
}

export default PianoMidiInput;
