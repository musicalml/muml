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
      //time
      time: 0,
      last: null,
      timeScale: 2,
    };

    this.noteStream = React.createRef();
    this.onPianoKeyEvent = this.onPianoKeyEvent.bind(this);
    this.onTick = this.onTick.bind(this);
  };

  componentDidMount() {
    requestAnimationFrame(this.onTick);
  }

  onTick(time) {
    const scaled_time = time / 1000;
    if (!this.state.last)
      this.setState({last : scaled_time});
    const diff = scaled_time - this.state.last;
    if( this.noteStream.current ) {
      const new_time = this.state.time + diff;

      var unfinished = this.state.unfinished;
      var notes = this.state.notes.slice();
      for( const [key, value] of Object.entries(unfinished)) {
        notes[value][2] = new_time + this.state.timeScale;

      }
      this.setState({time: new_time, notes : notes});
      this.noteStream.current.drawNotes();
    }
    this.setState({last: scaled_time});
    requestAnimationFrame(this.onTick);
  }

  onPianoKeyEvent(key, active) {
    const state = {...this.state};
    const time = this.state.time + this.state.timeScale;
    if (active) {
      state.keysHeld = [
        ...this.state.keysHeld,
        key,
      ];
      state.notes.push([keyToMidiCode(key), time, this.state.time]);
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
    const time = this.state.time;
    const timeScale = this.state.timeScale;
    return(
      <div className={styles.screen_container}>
        <div className={styles.player_container}>
          <div className={styles.notestream_container}>
            <NoteStream
              ref={this.noteStream}
              notes={notes}
              time={time}
              timeScale={timeScale}
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