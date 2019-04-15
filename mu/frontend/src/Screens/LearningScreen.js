import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {ProgressBar, Button} from 'react-bootstrap';

import NoteStream from 'Piano/NoteStream';
import {midiCodeToKey, keyToMidiCode} from 'Piano/misc';

import {getChords, getTrackInfo, getNotes, compareTracks} from 'Api';

import styles from './LearningScreen.module.css';
import Piano from '../Piano';

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
      // Track info
      notes: null,
      chords: null,
      trackInfo: null,
      trackId: trackId ? trackId : null,
      // Learning
      currentChord: 0,
      keysHeld: [],
      keysHeldForChord: [],
      mistakeThisChord: false,
      mistakes: 0,
      score: null,
    };
    // Time. Is not a part of the state for perfomance reasons.
    this.time = 0;
    this.last = null;
    this.timeScale = 2;
    this.keyLog = []; // Should contain "note:time" pairs

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
    this.onTrackRated = this.onTrackRated.bind(this);
    this.noteStream = React.createRef();
  }

  static propTypes = {
    match: PropTypes.object,
    onFinishTrack: PropTypes.function,
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

  /**
   * Updates state on API response setting the song.
   * @param {Object} response - the API response.
   */
  onTrackLoaded(response) {
    this.setState({
      chords: response.map((chord)=>(chord['notes'].map(midiCodeToKey))),
      chordTimes: response.map((chord)=>(chord['time'])),
    });
  }

  /**
   * Updates state on API response setting the notes.
   * @param {Object} response - the API response
   */
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

  /**
   * requestAnimationFrame callback drawing the note screen
   * @param {Time} time - the current time
   */
  onTick(time) {
    requestAnimationFrame(this.onTick);
    let last = this.last;
    const scaledTime = time / 1000;
    if (!last) {
      last = scaledTime;
    }
    const diff = scaledTime - last;

    if (this.noteStream.current) {
      if (this.time + diff <= this.state.chordTimes[this.state.currentChord]) {
        this.time = this.time + diff;
      }
      this.noteStream.current.drawNotes(this.time, this.timeScale);
    }
    this.last = scaledTime;
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
    });
    this.time = 0;
    this.last = null;
  }

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
      this.keyLog.push([Date.now(), keyToMidiCode(key)]);
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
        if (this.finishedTrack(state)) {
          this.onFinishTrack();
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
   * A function used to determine whether the track is over.
   * @param {Object} state - the state. this.state is used if not provided
   * @return {Boolean} - the flag.
   */
  finishedTrack(state) {
    if (state === undefined) {
      return this.state.chords &&
        this.state.currentChord === this.state.chords.length;
    } else {
      return state.currentChord === state.chords.length;
    }
  }

  /**
   * A function called when all the nots have been played.
   * Calls props callback if provided.
   */
  onFinishTrack() {
    const keyLog = this.keyLog.map((pair) => [144, pair[1], 127, pair[0]]);
    const data = {notes: keyLog};
    console.log(this.state.trackId, data);
    compareTracks(this.state.trackId, data).then(this.onTrackRated);
    if (this.props.onFinishTrack) {
      this.props.onFinishTrack(this.state.mistakes);
    }
  }

  /**
   * A callback for the track rating API response, sets the score state.
   * @param {Object} response - the api response.
   */
  onTrackRated(response) {
    console.log(response);
    this.setState({
      score: response.grade,
    });
  }

  /**
   * Resets the component if needed. Meant to be called using ref.
   */
  resetTrainer() {
    this.setState({
      ...this.state,
      currentChord: 0,
      keysHeld: [],
      mistakes: 0,
      keysHeldForChord: [],
    });
  }

  /**
   * A function to render the note stream.
   * @return {React.Node} - the rendered stream.
   */
  renderNoteStream() {
    const {chords, currentChord, notes} = this.state;
    const progressBarMax = chords !== null ? chords.length : 0;
    const highlightKeys = chords !== null ? chords[currentChord] : [];
    return (
      <div className={styles.player_container}>
        <div className={styles.controls_container}>
          <div className={styles.progressbar_container}>
            <ProgressBar style={{flex: 1, margin: 0}} max={progressBarMax} now={currentChord}/>
          </div>
          <Button onClick={this.reset}>Restart</Button>
        </div>
        <div className={styles.notestream_container}>
          {notes !== null &&
          <NoteStream
            ref={this.noteStream}
            notes={notes}
          />}
        </div>
        <div className={styles.piano_container}>
          {chords !== null &&
          <Piano highlightKeys={highlightKeys}
            onPianoKeyEvent={this.onPianoKeyEvent}
          />}
        </div>
      </div>
    );
  }

  /**
   * A function to render the done screen.
   * @return {React.Node} - the rendered screen.
   */
  renderDoneScreen() {
    const {score} = this.state;
    return (
      <div>
        {score === null ? <h1>Computing your score...</h1>
                        : <h1>You scored {(score * 100).toFixed(0)}%</h1>}
        <Button bsSize='large' onClick={this.reset}>Restart</Button>
      </div>
    );
  }

  /**
   * Renders the piano and controls.
   * @return {React.Node} - The rendered screen.
   */
  render() {
    const {currentChord, mistakes, trackInfo} = this.state;
    const correctPercent = (1 - mistakes/currentChord) * 100;
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
        {this.finishedTrack() ? this.renderDoneScreen()
                              : this.renderNoteStream()}
      </div>
    );
  }
}

export default LearningScreen;
