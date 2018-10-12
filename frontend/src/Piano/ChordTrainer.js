import React, {Component} from 'react';
import PropTypes from 'prop-types';

import Piano from './Piano';

/**
 * A class that draws a piano with highlighting the chords to play.
 * @class ChordTrainer
 */
class ChordTrainer extends Component {
  /**
   * Default constructor, sets initial state and saves the chords.
   * @param {Object} props - the props.
   */
  constructor(props) {
    super(props);
    this.chords = this.props.chords;
    this.state = {
      chord: 0,
      keysHeld: [],
      mistakes: 0,
      keysHeldForChord: [],
    };
    this.onPianoKeyEvent = this.onPianoKeyEvent.bind(this);
  }

  static propTypes = {
    chords: PropTypes.array,
    onFinishTrack: PropTypes.func,
    onCorrectChord: PropTypes.func,
    onMistake: PropTypes.func,
  }

  /**
   * Event when a piano key is pressed/depressed. Held keys are updated and
   * checked against pending chord.
   * @param {String} key - key in musical notation.
   * @param {Boolean} active - whether the key is pressed or depressed.
   */
  onPianoKeyEvent(key, active) {
    const state = this.state;
    const chord = this.chords[this.state.chord];
    if (active) {
      state.keysHeld = [
        ...this.state.keysHeld,
        key,
      ];
      if (chord.includes(key)) {
        state.keysHeldForChord = [
          ...this.state.keysHeldForChord,
          key,
        ];
      } else {
        state.mistakes++;
        this.onMistake(key);
      }
    } else {
      state.keysHeld =
        state.keysHeld.filter((stateKey) => (stateKey !== key));
      if (state.keysHeldForChord.includes(key)) {
        state.mistakes++;
        this.onMistake(key);
        state.keysHeldForChord =
          state.keysHeldForChord.filter((stateKey) => (stateKey !== key));
      }
    }
    const highlightKeys = chord.sort();
    const sortedKeysHeld = this.state.keysHeld.sort();
    if (highlightKeys.join(',') === sortedKeysHeld.join(',')) {
      state.chord++;
      state.keysHeldForChord = [];
      this.onCorrectChord();
      if (state.chord === this.chords.length) {
        if (this.props.onFinishTrack) {
          this.props.onFinishTrack(state.mistakes);
        }
        state.chord = 0;
      }
    }
    this.setState(state);
  }

  /**
   * Event triggered when the chord is pressed correctly.
   */
  onCorrectChord() {
    if (this.props.onCorrectChord) {
      this.props.onCorrectChord();
    }
  }

  /**
   * Event triggered on pressing or releasing the wrong button.
   * @param {String} key - key in musical notation.
   */
  onMistake(key) {
    if (this.props.onMistake) {
      this.props.onMistake(key);
    }
  }

  /**
   * Resets the component if needed. Meant to be called using ref.
   */
  reset() {
    this.setState({
      ...this.state,
      chord: 0,
      keysHeld: [],
      mistakes: 0,
      keysHeldForChord: [],
    });
  }

  /**
   * Renders the piano highlighting the pending chord.
   * @return {React.Node} - rendered piano.
   */
  render() {
    const highlightKeys = this.chords[this.state.chord];
    return (
      <Piano highlightKeys={highlightKeys}
        onPianoKeyEvent={this.onPianoKeyEvent}/>
    );
  }
}

export default ChordTrainer;
