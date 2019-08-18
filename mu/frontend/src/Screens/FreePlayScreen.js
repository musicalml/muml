import React, {Component} from 'react';
import styles from './FreePlayScreen.module.css';
import NoteStream from '../Piano/NoteStream';
import Piano from '../Piano';
import Tone from 'tone';

import {keyToMidiCode} from '../Piano/misc';

/**
 * A screen for playing without any tutoring.
 */
class FreePlayScreen extends Component {
  /**
   * Default constructor.
   * @param {Object} props - the props.
   */
  constructor(props) {
    super(props);
    this.state = {
      keysHeld: [],
      notes: [],
      unfinished: {},
    };

    // Time
    this.time = 0;
    this.last = null;
    this.timeScale = 2;

    this.noteStream = React.createRef();
    this.onPianoKeyEvent = this.onPianoKeyEvent.bind(this);
    this.onTick = this.onTick.bind(this);
  };

  /**
   * A callback that inserts into the rendering pipeline.
   */
  componentDidMount() {
    requestAnimationFrame(this.onTick);
  }

  /**
   * A function that draws the canvas every tick.
   * @param {Number} time - the current tume;
   */
  onTick(time) {
    requestAnimationFrame(this.onTick);
    let last = this.last;
    const scaledTime = time / 1000;
    if (!last) {
      last = scaledTime;
    }
    const diff = scaledTime - last;
    this.time = this.time + diff;

    if (this.noteStream.current ) {
      let unfinished = this.state.unfinished;
      let notes = this.state.notes.slice();
      for (const [key, value] of Object.entries(unfinished)) {
        notes[value][2] = this.time + this.timeScale;
      }
      this.setState({notes: notes});
      this.noteStream.current.drawNotes(this.time, this.timeScale);
    }
    this.last = scaledTime;
  }

  /**
   * Event when a piano key is pressed/depressed. Held keys are updated.
   * @param {String} key - key in musical notation.
   * @param {Boolean} active - whether the key is pressed or depressed.
   */
  onPianoKeyEvent(key, active) {
    const state = {...this.state};
    const time = this.time + this.timeScale;
    if (active) {
      state.keysHeld = [
        ...this.state.keysHeld,
        key,
      ];
      state.notes.push([keyToMidiCode(key), time, this.time]);
      state.unfinished[key] = state.notes.length - 1;
    } else {
      state.keysHeld =
        state.keysHeld.filter((stateKey) => (stateKey !== key));
      state.notes[state.unfinished[key]][2] = time;
      delete state.unfinished[key];
    }
    this.setState(state);
  }

  /**
   * Draws the screen with playing canvas.
   * @return {React.Node} - the screen.
   */
  render() {
    const highlightKeys = this.state.keysHeld;
    const notes = this.state.notes;
    return (
      <div className={styles.screen_container}>
        <div className={styles.notestream_container}>
          <NoteStream
            ref={this.noteStream}
            notes={notes}
            change={true}
          />
        </div>
        <div className={styles.piano_container}>
          <Piano highlightKeys={highlightKeys}
            onPianoKeyEvent={this.onPianoKeyEvent}
          />
        </div>
      </div>
    );
  }
};

export default FreePlayScreen;
