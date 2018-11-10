import React, {Component} from 'react';
import PropTypes from 'prop-types';

import PianoKey from './PianoKey';
import {keysWithFakes} from './misc';

import styles from './Piano.module.css';

const isBlack = (key) => (key.includes('#'));
const isWhite = (key) => (!isBlack(key));

/**
 * A piano keyboard component that is responsible for rendering piano keys
 * and forwarding key presses to handlers.
 */
class PianoKeyboard extends Component {
  /**
   * Default constructor, constructs lists of keys
   * @param {Object} props - the props, have to contain keys.
   */
  constructor(props) {
    super(props);
    this.state = {
      pressedScreenKeys: [],
      stickyKey: false,
    };
    this.keyToState = this.keyToState.bind(this);
    this.whiteKeys = keysWithFakes.filter(isWhite)
        .map(this.keyToState);
    this.blackKeys = keysWithFakes.filter(isBlack)
        .map(this.keyToState);
    this.buttonToComponent = this.buttonToComponent.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
  }

  static propTypes = {
    onMouseEvent: PropTypes.func,
    pressedKeys: PropTypes.array,
    highlightKeys: PropTypes.array,
  };

  /**
   * Sets event listeners for shift button.
   */
  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('keyup', this.onKeyUp);
  }

  /**
   * Unsets event listeners for shift button.
   */
  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('keyup', this.onKeyUp);
  }

  /**
   * KeyDown handler, sets "shift down" flag.
   * @param {Object} e - the event.
   */
  onKeyDown(e) {
    if (e.key !== 'Shift') {
      return;
    }
    this.setState({
      stickyKey: true,
    });
  }

  /**
   * KeyUp handler, unsets "shift down" flag and unpresses all the buttons.
   * @param {Object} e - the event.
   */
  onKeyUp(e) {
    if (e.key !== 'Shift') {
      return;
    }
    this.setState({
      stickyKey: false,
    });
    this.state.pressedScreenKeys.forEach((key) => {
      if (this.props.onMouseEvent) {
        this.props.onMouseEvent(key, false);
      }
    });
    this.setState({
      pressedScreenKeys: [],
    });
  }

  /**
   * A mapper function that maps a key name to click handlers.
   * @param {String} key - a key in musical notation.
   * @return {Object} - an object containing the key and handlers.
   */
  keyToState(key) {
    const isFake = key.includes('Fake');
    return {
      onMouseDown: !isFake ? this.pianoKeyMouseEvent.bind(this, key, true)
                          : null,
      onMouseUp: !isFake ? this.pianoKeyMouseEvent.bind(this, key, false)
                        : null,
      key: key,
    };
  }

  /**
   * A callback function for mouseup/mousedown
   * @param {String} key - the key in musical notation
   * @param {Boolean} active - whether the key is pressed or depressed
   */
  pianoKeyMouseEvent(key, active) {
    if (active) {
      if (this.props.onMouseEvent) {
        this.props.onMouseEvent(key, active);
      }
      this.setState({
        pressedScreenKeys: [...this.state.pressedScreenKeys, key],
      });
    } else {
      if (!this.state.stickyKey) {
        if (this.props.onMouseEvent) {
          this.props.onMouseEvent(key, active);
        }
        this.setState({
          pressedScreenKeys: this.state.pressedScreenKeys
              .filter((scrKey) => (scrKey !== key)),
        });
      }
    }
  }

  /**
   * Transforms a button object to a PianoKey component with correct ClassName.
   * @param {Object} button - the button to be transformed
   * @return {React.Node} - the rendered component
   */
  buttonToComponent(button) {
    return (
      <PianoKey
        black={isBlack(button.key)}
        highlight={(this.props.highlightKeys) ? this.props.highlightKeys.includes(button.key) : false}
        pressed={this.props.pressedKeys.includes(button.key)}
        invisible={button.key.includes('Fake')}
        onMouseDown={button.onMouseDown}
        onMouseUp={button.onMouseUp}
        key={button.key}
      />
    );
  }

  /**
   * Renders the keyboard with pressed and depressed keys.
   * There is a trick for rendering black keys with fake invisible ones.
   * Pressing them is not supported.
   * @return {React.Node} - the rendered keyboard.
   */
  render() {
    return (
      <div className={styles.piano}>
        <div className={styles.white_keys_container}>
          {this.whiteKeys.map(this.buttonToComponent)}
        </div>
        <div className={styles.black_keys_container}>
          {this.blackKeys.map(this.buttonToComponent)}
        </div>
      </div>
    );
  }
}

export default PianoKeyboard;
