import React, {Component} from 'react';
import PropTypes from 'prop-types';

import PianoKey from './PianoKey';

import './Piano.css';

/**
 * A piano keyboard component that is responsible for rendering piano keys
 * and forwarding key presses to handlers.
 */
class PianoKeyboard extends Component {
  /**
   * Default constructor, constructs lists of keys
   * @param {Object} props - the props, have to contain whiteKeys and blackKeys.
   */
  constructor(props) {
    super(props);
    this.keyToState = this.keyToState.bind(this);
    this.whiteKeys = props.whiteKeys.map(this.keyToState);
    this.blackKeys = props.blackKeys.map(this.keyToState);
  }

  static propTypes = {
    whiteKeys: PropTypes.array,
    pressedWhiteKeys: PropTypes.array,
    blackKeys: PropTypes.array,
    pressedBlackKeys: PropTypes.array,
    onMouseEvent: PropTypes.func,
  }

  /**
   * A mapper function that maps a key name to click handlers.
   * @param {String} key - a key in musical notation.
   * @return {Object} - an object containing the key and handlers.
   */
  keyToState(key) {
    return {
      onMouseDown: this.pianoKeyMouseEvent.bind(this, key, true),
      onMouseUp: this.pianoKeyMouseEvent.bind(this, key, false),
      key: key,
    };
  }

  /**
   * A callback function for mouseup/mousedown
   * @param {String} key - the key in musical notation
   * @param {Boolean} active - whether the key is pressed or depressed
   */
  pianoKeyMouseEvent(key, active) {
    if (this.props.onMouseEvent) {
      this.props.onMouseEvent(key, active);
    }
  }

  /**
   * Renders the keyboard with pressed and depressed keys.
   * There is a trick for rendering black keys with fake invisible ones.
   * Pressing them is not supported.
   * @return {React.Node} - the rendered keyboard.
   */
  render() {
    const {pressedWhiteKeys, pressedBlackKeys} = this.props;
    return (
      <div className={'piano'}>
        <div className={'white_keys_container'}>
          {this.whiteKeys.map((button)=>(
            <PianoKey className={pressedWhiteKeys.includes(button.key)
                                 ? 'white_key white_key_pressed'
                                 : 'white_key'}
            onMouseDown={button.onMouseDown}
            onMouseUp={button.onMouseUp}
            key={button.key}
            />
          ))}
        </div>
        <div className={'black_keys_container'}>
          {this.blackKeys.map((button)=>{
            const className = pressedBlackKeys.includes(button.key)
                              ? 'black_key black_key_pressed'
                              : 'black_key';
            return (<PianoKey className={button.key.includes('Fake')
                                             ? 'black_key black_key_invisible'
                                             : className}
            onMouseDown={button.onMouseDown}
            onMouseUp={button.onMouseUp}
            key={button.key}
            />);
          })}
        </div>
      </div>
    );
  }
}

export default PianoKeyboard;
