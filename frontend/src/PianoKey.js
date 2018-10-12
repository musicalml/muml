import React, { Component } from 'react';

class PianoKey extends Component {
  constructor(props) {
    super(props);

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
  }

  onMouseDown() {
    if (this.props.onMouseDown) {
      this.props.onMouseDown();
    }
    document.addEventListener('mouseup', this.onMouseUp);
  }

  onMouseUp() {
    if (this.props.onMouseUp) {
      this.props.onMouseUp()
    }
    document.removeEventListener('mouseup', this.onMouseUp);
  }

  render() {
    const {className} = this.props;
    return (
        <div onMouseDown={this.onMouseDown} className={className} />
    );
  }
}

export default PianoKey;
