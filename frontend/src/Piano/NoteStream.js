import React, {Component} from 'react';
const bw = 0.72;
const shift = [0, 1 - bw/2, 1, 2 - bw/2, 2, 3, 4 - bw/2, 4, 5 - bw/2, 5, 6 - bw/2, 6];
const black_keys = [1, 3, 6, 8, 10];
const R = 5;

class NoteStream extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notes : props.notes.sort((a,b) => a[1] - b[1]), //note, start, finish
      time: props.time,
      hidden_notes: 0
    };
    this.drawNotes = this.drawNotes.bind(this);
    this.inBounds = this.inBounds.bind(this);
    this.drawNote = this.drawNote.bind(this);
    this.reset = this.reset.bind(this);
  }

  componentDidMount() {
    const canvas = this.refs.canvas;
    this.ctx = canvas.getContext("2d");
  }

  componentDidUpdate() {
  }


  drawNotes() {
    let cur_notes;
    if( this.props.change !== null ) {
      cur_notes = this.props.notes;
    } else {
      cur_notes = this.state.notes;
    }
    this.ctx.clearRect(0, 0, 1924, 1000);

    let i = this.state.hidden_notes;
    let foundStart = false;
    let new_i = i;
    let limit = 1000;
    while( true ) {
      if( i >= cur_notes.length ) {
        break;
      }
      if ( this.inBounds(cur_notes[i][1], cur_notes[i][2]) ) {
        if( !foundStart ) {
          new_i = i;
          foundStart = true;
        }
        limit = cur_notes[i][2];
        const low = (cur_notes[i][1] - this.props.time) / this.props.timeScale * 1000;
        const high = (cur_notes[i][2] - this.props.time) / this.props.timeScale * 1000;
        this.drawNote(cur_notes[i][0], low, high);
      } else {
        if( foundStart && cur_notes[i][1] >= limit ) {
          break;
        }
      }
      i++;

    }
    this.setState({hidden_notes : new_i});
    if( this.props.changeFrom !== null ) {
      this.setState({notes : cur_notes});
    }
  }

  drawNote(note, low, high) {
    const x = this.noteToX(note);
    const color = (black_keys.includes(note%12)) ? "GoldenRod" : "Gold";
    const width = (black_keys.includes(note%12)) ? 37*bw : 37;
    this.ctx.fillStyle = color;
    this.roundRect(this.ctx, x, 1000-high, width, high-low, R, true, true)
  }

  noteToX(note) {
    const octave = ~~((note - 12) / 12);
    const key = (note - 12) % 12;
    const x = (-185 + 259*octave) + 37*shift[key];
    return x;
  }

  roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof stroke == 'undefined') {
      stroke = true;
    }
    if (typeof radius === 'undefined') {
      radius = 5;
    }
    if (typeof radius === 'number') {
      radius = {tl: radius, tr: radius, br: radius, bl: radius};
    } else {
      let defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
      for (let side in defaultRadius) {
        radius[side] = radius[side] || defaultRadius[side];
      }
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if (fill) {
      ctx.fill();
    }
    if (stroke) {
      ctx.stroke();
    }

  }

  inBounds(l, t) {
    return !(l > this.props.time + this.props.timeScale || t < this.props.time);
  }

  reset() {
    this.setState({hidden_notes : 0})
  }


  render() {
    return(
        <canvas ref="canvas" width={1924} height={1000} />
    )
  }
}

export default NoteStream