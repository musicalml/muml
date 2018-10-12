import React, {Component} from 'react';
import PropTypes from 'prop-types';

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
   * Renders the key with provided className
   * @return {React.Node} - the rendered key
   */
  render() {
    const {className} = this.props;
    return (
      <div onMouseDown={this.onMouseDown} className={className} />
    );
  }
}

export default PianoKey;
