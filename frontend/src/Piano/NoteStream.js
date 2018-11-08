import React, {Component} from 'react';
const bw = 0.72;
const shift = [0, 1 - bw/2, 1, 2 - bw/2, 2, 3, 4 - bw/2, 4, 5 - bw/2, 5, 6 - bw/2, 6];
const black_keys = [1, 3, 6, 8, 10];
const R = 5;

class NoteStream extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notes : props.notes.sort((a,b) => a[1] - b[1]),
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

  drawNotes() {
    this.ctx.clearRect(0, 0, 1924, 1000);

    var i = this.state.hidden_notes;
    var foundStart = false;
    var new_i = i;
    var limit = 1000;
    while( true ) {
      if( i >= this.state.notes.length ) {
        break;
      }
      if ( this.inBounds(this.state.notes[i][1]) || this.inBounds(this.state.notes[i][2])) {
        if( !foundStart ) {
          new_i = i;
          foundStart = true;
        }
        limit = this.state.notes[i][2];
        const low = (this.state.notes[i][1] - this.props.time) / this.props.timeScale * 1000;
        const high = (this.state.notes[i][2] - this.props.time) / this.props.timeScale * 1000;
        this.drawNote(this.state.notes[i][0], low, high);
      } else {
        if( foundStart && this.state.notes[i][2] >= limit ) {
          break;
        }
      }
      i++;

    }
    this.setState({hidden_notes : new_i});
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
      var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
      for (var side in defaultRadius) {
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

  inBounds(t) {
    return (t >= this.props.time && t <= this.props.time + this.props.timeScale )
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