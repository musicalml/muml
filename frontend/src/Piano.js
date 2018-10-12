import React, { Component } from 'react';
import Tone from 'tone';
import 'jzz';

import PianoKeyboard from './PianoKeyboard';

const subContraKeys = ['A0', 'A#0', 'B0', 'FakeB#0'];
const fiveLinedKeys = ['C9'];
const octaveKeys = ['C', 'C#', 'D', 'D#', 'E', 'FakeE#', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'FakeB#'];
const fullOctaveKeys = [].concat(...[1, 2, 3, 4, 5, 6, 7, 8].map((octave)=>(
    octaveKeys.map((note)=>(note+octave)))));

const keysWithOctaves = [
  ...subContraKeys,
  ...fullOctaveKeys,
  ...fiveLinedKeys,
];

const keysWithoutFakes = keysWithOctaves.filter((key)=>(!key.includes('Fake')));

const whiteKeysWithOctaves = keysWithOctaves.filter(
  (key) => (!key.includes('#')));

const blackKeysWithOctaves = keysWithOctaves.filter(
  (key) => (key.includes('#')));

class Piano extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pressedWhiteKeys: [],
      pressedBlackKeys: [],
    }
    this.synth = new Tone.PolySynth(6, Tone.Synth).toMaster();
    this.synth.set('detune', 200);
    this.pianoKeyMouseEvent = this.pianoKeyMouseEvent.bind(this);
  }

  togglePianoKey(key, active, type) {
    const pressedKey = type === 'midi' ? 'midiPressed'
                                       : 'mousePressed';
    const otherKey = type !== 'midi'   ? 'midiPressed'
                                       : 'mousePressed';
    const stateKey = key.includes('#') ? 'pressedBlackKeys'
                                       : 'pressedWhiteKeys';
    let newKeys = this.state[stateKey].slice();
    const button = newKeys.find(
            (button) => (button.key === key));
    if (button === undefined) {
      newKeys = [
        ...newKeys,
        {
          [pressedKey]: true,
          [otherKey]: false,
          key: key,
        }
      ]
      this.synth.triggerAttack(key);
    } else {
      button[pressedKey] = active;
      if (!button.midiPressed && !button.mousePressed) {
        this.synth.triggerRelease(key);
        newKeys = newKeys.filter((button) => (button.key !== key));
      }
    }
    this.setState({
      ...this.state,
      [stateKey]: newKeys,
    });
  }

  pianoKeyMouseEvent(key, active) {
    this.togglePianoKey(key, active, 'mouse');
  }

  pianoKeyMidiEvent(keyCode, active) {
    if (keyCode < 21) {
      return;
    }
    const key = keysWithoutFakes[keyCode - 21];
    this.togglePianoKey(key, active, 'midi');
  }

  onMidiMessage = (message) => {
    if (message.data.length === 1 && message.data[0] === 254) {
      return;
    }

    if (message.data.length === 3) {
      if (message.data[0] === 144 && message.data[2] > 0) {  // note on
        this.pianoKeyMidiEvent(message.data[1], true);
      } else if (message.data[0] === 128 ||
                 message.data[0] === 144 && message.data[2] === 0) { // note off
        this.pianoKeyMidiEvent(message.data[1], false);
      } else if (message.data[0] === 176) {
        const value = (message.data[2] - 64) * 3000 / 64;
        this.synth.set('detune', value);
      } else {
        console.log(message.data);
      }
    } else {
      console.log(message.data);
    }

  };

  onMidiSuccess = (midiAccess) => {
    const inputs = midiAccess.inputs;
    inputs.forEach((input) => {
      input.onmidimessage = this.onMidiMessage;
    });
  };

  componentDidMount() {
    navigator.requestMIDIAccess().then(this.onMidiSuccess, console.log);
  }

  render() {
    const pressedWhiteKeys = this.state.pressedWhiteKeys.filter(
        (key) => (key.midiPressed || key.mousePressed)).map((key)=>(key.key));
    const pressedBlackKeys =  this.state.pressedBlackKeys.filter(
        (key) => (key.midiPressed || key.mousePressed)).map((key)=>(key.key));

    return(
      <PianoKeyboard
        whiteKeys={whiteKeysWithOctaves}
        blackKeys={blackKeysWithOctaves}
        pressedWhiteKeys={pressedWhiteKeys}
        pressedBlackKeys={pressedBlackKeys}
        onMouseEvent={this.pianoKeyMouseEvent}
      />
    );
  }
}

export default Piano;
