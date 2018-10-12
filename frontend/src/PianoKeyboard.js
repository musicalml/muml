import React, { Component } from 'react';

import PianoKey from './PianoKey';

import './Piano.css';

class PianoKeyboard extends Component {
  constructor(props) {
    super(props);
    this.keyToState = this.keyToState.bind(this);
    this.whiteKeys = props.whiteKeys.map(this.keyToState);
    this.blackKeys = props.blackKeys.map(this.keyToState);
  }

  keyToState(note) {
    this.props = 5;
    return {
      onMouseDown: this.pianoKeyMouseEvent.bind(this, note, true),
      onMouseUp: this.pianoKeyMouseEvent.bind(this, note, false),
      note: note,
    }
  }

  pianoKeyMouseEvent(key, active) {
    if (this.props.onMouseEvent) {
      this.props.onMouseEvent(key, active);
    }
  }

  render() {
    const {pressedWhiteKeys, pressedBlackKeys} = this.props;
    return(
      <div className={'piano'}>
        <div className={'white_keys_container'}>
          {this.whiteKeys.map((button)=>(
            <PianoKey className={pressedWhiteKeys.includes(button.note)
                                 ? 'white_key white_key_pressed'
                                 : 'white_key'}
                      onMouseDown={button.onMouseDown}
                      onMouseUp={button.onMouseUp}
            />
          ))}
        </div>
        <div className={'black_keys_container'}>
          {this.blackKeys.map((button)=>{
            const className = pressedBlackKeys.includes(button.note)
                              ? 'black_key black_key_pressed'
                              : 'black_key';
            return (<PianoKey className={button.note.includes('Fake')
                                             ? 'black_key black_key_invisible'
                                             : className}
                      onMouseDown={button.onMouseDown}
                      onMouseUp={button.onMouseUp}
            />)
          })}
        </div>
      </div>
    );
  }
}

export default PianoKeyboard;
