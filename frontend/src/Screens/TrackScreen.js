import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {ProgressBar, Button} from 'react-bootstrap';

import ChordTrainer from 'Piano/ChordTrainer';
import {midiCodeToKey} from 'Piano/misc';

import {getChords, getTrackInfo} from 'Api';

import styles from './TrackScreen.module.css';

/**
 * A screen for playing a song or free play.
 */
class TrackScreen extends Component {
  /**
   * Default constructor.
   * @param {Object} props - the props.
   */
  constructor(props) {
    super(props);
    const {trackId} = this.props.match.params;
    this.state = {
      chords: null,
      trackId: trackId ? trackId : null,
      currentChord: 0,
      mistakeThisChord: false,
      mistakes: 0,
      trackInfo: null,
    };
    this.onTrackLoaded = this.onTrackLoaded.bind(this);
    this.onTrackInfoLoaded = this.onTrackInfoLoaded.bind(this);
    this.resetMistakeMessage = this.resetMistakeMessage.bind(this);
    this.onMistake = this.onMistake.bind(this);
    this.reset = this.reset.bind(this);
    this.onCorrectChord = this.onCorrectChord.bind(this);
    this.trainer = React.createRef();
  }

  static propTypes = {
    match: PropTypes.object,
  }

  /**
   * Fetches the track.
   */
  componentDidMount() {
    if (this.state.trackId !== null) {
      getChords(this.state.trackId).then(this.onTrackLoaded);
      getTrackInfo(this.state.trackId).then(this.onTrackInfoLoaded);
    }
  }

  /**
   * Updates state on API response setting the song.
   * @param {Object} response - the API response.
   */
  onTrackLoaded(response) {
    this.setState({
      chords: response.map((chord)=>(chord.map(midiCodeToKey))),
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
    this.setState({
      mistakes: 0,
      currentChord: 0,
      mistakeThisChord: false,
    });
  }

  /**
   * Resets the trainer component.
   */
  resetTrainer() {
    this.trainer.current.reset();
  }

  /**
   * Renders the piano and controls.
   * @return {React.Node} - The rendered screen.
   */
  render() {
    const {chords, currentChord,
      mistakes, trackInfo} = this.state;
    const progressBarMax = chords !== null ? chords.length : 0;
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
        <div className={styles.player_container}>
          <div className={styles.controls_container}>
            <div className={styles.progressbar_container}>
              <ProgressBar max={progressBarMax} now={currentChord}/>
            </div>
            <Button onClick={this.reset}>Restart</Button>
          </div>
          <div className={styles.piano_container}>
            {chords !== null &&
              <ChordTrainer
                chords={chords}
                onMistake={this.onMistake}
                onCorrectChord={this.onCorrectChord}
                ref={this.trainer}
              />}
          </div>
        </div>
      </div>
    );
  }
}

export default TrackScreen;
