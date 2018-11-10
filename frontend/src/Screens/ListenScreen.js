import React, {Component} from 'react';
import styles from './TrackScreen.module.css';
import NoteStream from "../Piano/NoteStream";
import Piano from "../Piano";
import Tone from 'tone';

import { getNotes, getTrackInfo} from "../Api";
import {midiCodeToKey} from 'Piano/misc';


class ListenScreen extends Component {
  constructor(props) {
    super(props);
    const {trackId} = this.props.match.params;
    this.state = {
      notes: null,
      trackInfo: null,
      trackId: trackId ? trackId : null,
      //time
      time: 0,
      last: null,
      timeScale: 2,
      //sound
      onNotes: [],
      noteToCheck: 0
    };

    this.synth = new Tone.PolySynth(6, Tone.Synth).toMaster();

    this.onTick = this.onTick.bind(this);
    this.onNotesLoaded = this.onNotesLoaded.bind(this);
    this.onTrackInfoLoaded = this.onTrackInfoLoaded.bind(this);
    this.turnOffNotes = this.turnOffNotes.bind(this);
    this.turnOnNotes = this.turnOnNotes.bind(this);
    this.noteStream = React.createRef();
  };

  componentDidMount() {
    if (this.state.trackId !== null) {
      getTrackInfo(this.state.trackId).then(this.onTrackInfoLoaded);
      getNotes(this.state.trackId).then(this.onNotesLoaded);
      requestAnimationFrame(this.onTick);
    }
  }

  onNotesLoaded(response) {
    this.setState({
      notes: response,
    });
  }

  /**
   * Updates stored track info on API response.
   * @param {Object} response - the API response.
   */
  onTrackInfoLoaded(response) {
    this.setState({
      trackInfo: response,
    });
  }

  onTick(time) {
    //computing
    const scaled_time = time / 1000;
    let last = this.state.last;
    let onNotes = this.state.onNotes;
    let noteToCheck = this.state.noteToCheck;
    if (!last)
      last = scaled_time;
    const diff = scaled_time - last;
    const new_time = this.state.time + diff;
    if(this.state.notes) {
      onNotes = this.turnOffNotes(onNotes, new_time);
      [noteToCheck, onNotes] = this.turnOnNotes(onNotes, new_time);
    }
    //updating
    this.setState({time: new_time});
    if( this.noteStream.current ) {
      //this updates NoteStream
      this.noteStream.current.drawNotes();
    }
    //not related to NoteStream container
    this.setState({last: scaled_time, noteToCheck : noteToCheck, onNotes : onNotes});
    requestAnimationFrame(this.onTick);
  }

  turnOffNotes(notes, time) {
    let new_onNotes = [];
    for( let i = 0; i < notes.length; ++i ) {
      if( notes[i][2] < time ) {
        this.synth.triggerRelease(midiCodeToKey(notes[i][0]));
      } else {
        new_onNotes.push(notes[i]);
      }
    }
    return new_onNotes;
  }

  turnOnNotes(onNotes, time) {
    let i = this.state.noteToCheck;
    let newNotes = [];
    while( i < this.state.notes.length && this.state.notes[i][1] <= time ) {
      this.synth.triggerAttack(midiCodeToKey(this.state.notes[i][0]));
      newNotes.push(this.state.notes[i]);
      i++;
    }
    const new_onNotes = onNotes.slice().concat(newNotes);
    return [i, new_onNotes];
  }

  render() {
    const notes = this.state.notes;
    const time = this.state.time;
    const timeScale = this.state.timeScale;
    return(
      <div className={styles.screen_container}>
        <div className={styles.player_container}>
          <div className={styles.notestream_container}>
            {notes && <NoteStream
              ref={this.noteStream}
              notes={notes}
              time={time}
              timeScale={timeScale}
              change={false}
            />}
          </div>
          <div className={styles.piano_container}>
            <Piano
            />
          </div>
        </div>
      </div>
    )
  }
};

export default ListenScreen;