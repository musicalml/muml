import React, {Component} from 'react';
import styles from './TrackScreen.module.css';
import NoteStream from "../Piano/NoteStream";
import Piano from "../Piano";

import {keyToMidiCode} from '../Piano/misc';


class FreePlayScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      keysHeld: [],
      notes: [],
      unfinished: {},
    };


    //time
    this.time = 0;
    this.last = null;
    this.timeScale = 2;

    this.noteStream = React.createRef();
    this.onPianoKeyEvent = this.onPianoKeyEvent.bind(this);
    this.onTick = this.onTick.bind(this);
  };

  componentDidMount() {
    requestAnimationFrame(this.onTick);
  }

  onTick(time) {
    requestAnimationFrame(this.onTick);
    let last = this.last;
    const scaled_time = time / 1000;
    if (!last)
      last = scaled_time;
    const diff = scaled_time - last;
    this.time = this.time + diff;



    if( this.noteStream.current ) {
      let unfinished = this.state.unfinished;
      let notes = this.state.notes.slice();
      for( const [key, value] of Object.entries(unfinished)) {
        notes[value][2] = this.time + this.timeScale;
      }
      this.setState({notes : notes});
      this.noteStream.current.drawNotes(this.time, this.timeScale);
    }
    this.last = scaled_time;
  }

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

  render() {
    const highlightKeys = this.state.keysHeld;
    const notes = this.state.notes;
    return(
      <div className={styles.screen_container}>
        <div className={styles.player_container}>
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
      </div>
    )
  }
};

export default FreePlayScreen;