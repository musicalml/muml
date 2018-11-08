import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {ProgressBar, Button} from 'react-bootstrap';

import NoteStream from 'Piano/NoteStream'
import {midiCodeToKey} from 'Piano/misc';

import {getChords, getTrackInfo, getNotes} from 'Api';

import styles from './TrackScreen.module.css';
import Piano from "../Piano";

/**
 * A screen for playing a song or free play.
 */
class LearningScreen extends Component {
  /**
   * Default constructor.
   * @param {Object} props - the props.
   */
  constructor(props) {
    super(props);
    const {trackId} = this.props.match.params;
    this.state = {
      //track info
      notes: null,
      chords: null,
      trackInfo: null,
      trackId: trackId ? trackId : null,
      //time
      time: 0,
      last: null,
      //learning
      currentChord: 0,
      keysHeld: [],
      keysHeldForChord: [],
      mistakeThisChord: false,
      mistakes: 0,
    };
    this.onTrackLoaded = this.onTrackLoaded.bind(this);
    this.onNotesLoaded = this.onNotesLoaded.bind(this);
    this.onTrackInfoLoaded = this.onTrackInfoLoaded.bind(this);
    this.resetMistakeMessage = this.resetMistakeMessage.bind(this);
    this.onMistake = this.onMistake.bind(this);
    this.reset = this.reset.bind(this);
    this.onCorrectChord = this.onCorrectChord.bind(this);
    this.onTick = this.onTick.bind(this);
    this.onPianoKeyEvent = this.onPianoKeyEvent.bind(this);
    this.resetTrainer = this.resetTrainer.bind(this);
    this.noteStream = React.createRef();
  }

  static propTypes = {
    match: PropTypes.object,
  };

  /**
   * Fetches the track.
   */
  componentDidMount() {
    if (this.state.trackId !== null) {
      getChords(this.state.trackId).then(this.onTrackLoaded);
      getTrackInfo(this.state.trackId).then(this.onTrackInfoLoaded);
      getNotes(this.state.trackId).then(this.onNotesLoaded);
      requestAnimationFrame(this.onTick);
    }
  }

  componentWillUnmount() {
  }

  /**
   * Updates state on API response setting the song.
   * @param {Object} response - the API response.
   */
  onTrackLoaded(response) {
    this.setState({
      chords: response.map((chord)=>(chord['notes'].map(midiCodeToKey))),
      chord_times: response.map((chord)=>(chord['time']))
    });
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
    const scaled_time = time / 1000;
    if (!this.state.last)
      this.setState({last : scaled_time});
    const diff = scaled_time - this.state.last;
    if( this.noteStream.current ) {
      if( this.state.time + diff <= this.state.chord_times[this.state.currentChord]) {
        const new_time = this.state.time + diff;
        this.setState({time: new_time});
      }
      this.noteStream.current.drawNotes();
    }
    this.setState({last: scaled_time});
    requestAnimationFrame(this.onTick);
  }

  /**
   * Incorrect key press handler
   * @param {String} key - key in musical notation.
   */
  onMistake(key) {
    this.setState({
      mistakeThisChord: true,
    });
  }

  /**
   * A callback that resets mistake flag and increases the progress bar.
   */
  onCorrectChord() {
    if (this.state.mistakeThisChord) {
      this.setState({
        mistakes: this.state.mistakes + 1,
      });
    }
    this.setState({
      currentChord: this.state.currentChord + 1,
      mistakeThisChord: false,
    });
  }

  /**
   * A callback to reset the error message.
   */
  resetMistakeMessage() {
    this.setState({
      mistake: false,
    });
  }

  /**
   * A callback to reset state to "did not start playing"
   */
  reset() {
    this.resetTrainer();
    this.noteStream.current.reset();
    this.setState({
      mistakes: 0,
      currentChord: 0,
      mistakeThisChord: false,
      time: 0,
      last: null,
    });
  }

  /**
   * Resets the trainer component.
   */

  /**
   * Event when a piano key is pressed/depressed. Held keys are updated and
   * checked against pending chord.
   * @param {String} key - key in musical notation.
   * @param {Boolean} active - whether the key is pressed or depressed.
   */
  onPianoKeyEvent(key, active) {
    const state = {...this.state};
    const chord = state.chords[this.state.currentChord];
    if (active) {
      state.keysHeld = [
        ...this.state.keysHeld,
        key,
      ];
      if (!chord.includes(key)) {
        state.mistakes++;
        this.onMistake(key);
      }
      state.keysHeldForChord = [
        ...this.state.keysHeldForChord,
        key,
      ];
      const highlightKeys = chord.sort();
      const sortedKeysHeld = state.keysHeldForChord.sort();
      if (highlightKeys.join(',') === sortedKeysHeld.join(',')) {
        state.currentChord++;
        state.keysHeldForChord = [];
        this.onCorrectChord();
        if (state.currentChord === state.chords.length) {
          if (this.props.onFinishTrack) {
            this.props.onFinishTrack(state.mistakes);
          }
          state.currentChord = 0;
        }
      }
    } else {
      state.keysHeld =
        state.keysHeld.filter((stateKey) => (stateKey !== key));
      if (state.keysHeldForChord.includes(key) && chord.includes(key)) {
        state.mistakes++;
        this.onMistake(key);
      }
      state.keysHeldForChord =
        state.keysHeldForChord.filter((stateKey) => (stateKey !== key));
    }
    this.setState(state);
  }

  /**
   * Resets the component if needed. Meant to be called using ref.
   */
  resetTrainer() {
    this.setState({
      ...this.state,
      chord: 0,
      keysHeld: [],
      mistakes: 0,
      keysHeldForChord: [],
    });
  }


  /**
   * Renders the piano and controls.
   * @return {React.Node} - The rendered screen.
   */
  render() {
    const {chords, currentChord,
      mistakes, trackInfo, notes, time} = this.state;
    const progressBarMax = chords !== null ? chords.length : 0;
    const correctPercent = (1 - mistakes/currentChord) * 100;
    const highlightKeys = chords !== null ? chords[currentChord] : [];
    return (
      <div className={styles.screen_container}>
        <div className={styles.stats_container}>
          { trackInfo !== null &&
            <h1>{trackInfo.name}</h1>}
          { currentChord > 0 &&
            <p>{`Correct: ${correctPercent.toFixed(0)}%`}</p>}
          { currentChord === 0 &&
            <p>{`Start playing!`}</p>}
        </div>
        <div className={styles.player_container}>
          <div className={styles.controls_container}>
            <div className={styles.progressbar_container}>
              <ProgressBar max={progressBarMax} now={currentChord}/>
            </div>
            <Button onClick={this.reset}>Restart</Button>
          </div>
          <div className={styles.notestream_container}>
            {notes !== null &&
            <NoteStream
              ref={this.noteStream}
              notes={notes}
              time={time}
              timeScale={2}
            />}
          </div>
          <div className={styles.piano_container}>
            {chords !== null &&
            <Piano highlightKeys={highlightKeys}
                   onPianoKeyEvent={this.onPianoKeyEvent}
            />}
          </div>
        </div>
      </div>
    );
  }
}

export default LearningScreen;
