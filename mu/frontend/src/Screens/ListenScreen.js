import React, {Component} from 'react';
import freePlayStyles from './FreePlayScreen.module.css';
import styles from './ListenScreen.module.css';
import NoteStream from '../Piano/NoteStream';
import Piano from '../Piano';
import Tone from 'tone';

import {getNotes, getTrackInfo} from '../Api';
import {midiCodeToKey} from 'Piano/misc';
import PianoSynth from '../Piano/PianoSynth';


class ListenScreen extends Component {
  constructor(props) {
    super(props);
    const {trackId} = this.props.match.params;
    this.state = {
      notes: null,
      trackInfo: null,
      trackId: trackId ? trackId : null,
    };
    this.time = -2;
    this.last = null;
    this.timeScale = 2;
    //sound
    this.onNotes =  [];
    this.noteToCheck = 0;

    this.synth = PianoSynth();

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
    requestAnimationFrame(this.onTick);
    //computing
    const scaled_time = time / 1000;
    let last = this.last;
    let onNotes = this.onNotes;
    let noteToCheck = this.noteToCheck;
    if (!last)
      last = scaled_time;
    const diff = scaled_time - last;
    const new_time = this.time + diff;

    //sound
    if(this.state.notes) {
      onNotes = this.turnOffNotes(onNotes, new_time);
      [noteToCheck, onNotes] = this.turnOnNotes(onNotes, new_time);
    }
    //updating NoteStream
    this.time = new_time;
    if( this.noteStream.current ) {
      //this updates NoteStream
      this.noteStream.current.drawNotes(this.time, this.timeScale);
    }
    //not related to NoteStream container
    this.last = scaled_time;
    this.noteToCheck = noteToCheck;
    this.onNotes = onNotes;

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
    let i = this.noteToCheck;
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
    const {notes, trackInfo} = this.state;
    return(
      <div className={styles.screen_container}>
        <div className={styles.header_container}>
          {trackInfo && <h1>{trackInfo.name}</h1>}
        </div>
        <div className={styles.free_play_container}>
          <div className={freePlayStyles.screen_container}>
            <div className={freePlayStyles.notestream_container}>
              {notes && <NoteStream
                ref={this.noteStream}
                notes={notes}
                change={false}
              />}
            </div>
            <div className={freePlayStyles.piano_container}>
              <Piano
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default ListenScreen;
