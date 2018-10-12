import React, {Component} from 'react';
import PropTypes from 'prop-types';

import styles from './Piano.module.css';

/**
 * A piano key handling clicks. className is sent from outside.
 * @class PianoKey
 */
class PianoKey extends Component {
  /**
   * Default constructor.
   */
  constructor() {
    super();
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
  }

  static propTypes = {
    black: PropTypes.bool,
    highlight: PropTypes.bool,
    pressed: PropTypes.bool,
    invisible: PropTypes.bool,
    className: PropTypes.string,
    onMouseDown: PropTypes.func,
    onMouseUp: PropTypes.func,
  }

  /**
   * A callback for mousedown. Registers mouseup callback with the document
   * in order to prevent mouse clicking and leaving without up event.
   */
  onMouseDown() {
    if (this.props.onMouseDown) {
      this.props.onMouseDown();
    }
    document.addEventListener('mouseup', this.onMouseUp);
  }

  /**
   * A callback for mouseup
   */
  onMouseUp() {
    if (this.props.onMouseUp) {
      this.props.onMouseUp();
    }
    document.removeEventListener('mouseup', this.onMouseUp);
  }

  /**
   * Returns the correct class for a white key.
   * @return {String} class of the key.
   */
  classForWhiteKey() {
    let classes = [styles.white_key];
    if (this.props.pressed) {
      classes.push(styles.white_key_pressed);
    }
    if (this.props.highlight) {
      classes.push(styles.white_key_highlighted);
    }
    return classes.join(' ');
  }

  /**
   * Returns the correct class for a black key.
   * @return {String} class of the key.
   */
  classForBlackKey() {
    let classes = [styles.black_key];
    if (this.props.pressed) {
      classes.push(styles.black_key_pressed);
    }
    if (this.props.highlight) {
      classes.push(styles.black_key_highlighted);
    }
    if (this.props.invisible) {
      classes.push(styles.black_key_invisible);
    }
    return classes.join(' ');
  }

  /**
   * Renders the key with provided className
   * @return {React.Node} - the rendered key
   */
  render() {
    const className = this.props.black ? this.classForBlackKey()
                                       : this.classForWhiteKey();
    return (
      <div onMouseDown={this.onMouseDown} className={className} />
    );
  }
}

export default PianoKey;
