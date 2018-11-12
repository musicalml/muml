import React, {Component} from 'react';
const bw = 0.72;
const shift = [0, 1 - bw/2, 1, 2 - bw/2, 2, 3, 4 - bw/2, 4, 5 - bw/2, 5, 6 - bw/2, 6];
const black_keys = [1, 3, 6, 8, 10];
const R = 5;

class PureCanvas extends React.Component {
  shouldComponentUpdate() {
    return false;
  }

  render() {
    return (
      <canvas
        width="1924"
        height="1000"
        ref={node =>
          node ? this.props.contextRef(node.getContext('2d')) : null
        }
      />
    );
  }
}

class NoteStreamCanvas extends Component {
  constructor(props) {
    super(props);
    this.drawNote = this.drawNote.bind(this);
    this.saveContext = this.saveContext.bind(this);
  }

  saveContext(ctx) {
    this.ctx = ctx;
    this.width = this.ctx.canvas.width;
    this.height = this.ctx.canvas.height;
  }

  componentDidUpdate() {
    const { notesToDraw} = this.props;
    this.ctx.clearRect(0, 0, 1924, 1000);
    for( let i = 0; i < notesToDraw.length; ++i ) {
      this.drawNote(notesToDraw[i][0], notesToDraw[i][1], notesToDraw[i][2])
    }
  }

  drawNote(note, low, high) {
    const x = this.noteToX(note);
    const color = (black_keys.includes(note%12)) ? "DarkSlateGray" : "DarkGreen";
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

  render() {
    return <PureCanvas contextRef={this.saveContext} />;
  }
}

class NoteStream extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notes : props.notes.sort((a,b) => a[1] - b[1]), //note, start, finish
      notesToDraw : [],
      time: props.time,
      hidden_notes: 0,
    };
    this.drawNotes = this.drawNotes.bind(this);
    this.inBounds = this.inBounds.bind(this);
    this.reset = this.reset.bind(this);
  }

  drawNotes(new_time, time_scale) {
    let cur_notes;
    if( this.props.change !== null ) {
      cur_notes = this.props.notes;
    } else {
      cur_notes = this.state.notes;
    }
    console.log(new_time, cur_notes);

    let i = this.state.hidden_notes;
    let foundStart = false;
    let new_i = i;
    let limit = 1000;
    let notesToDraw = [];

    while( true ) {
      if( i >= cur_notes.length ) {
        break;
      }
      if ( this.inBounds(cur_notes[i][1], cur_notes[i][2], new_time, time_scale) ) {
        if( !foundStart ) {
          new_i = i;
          foundStart = true;
        }
        limit = cur_notes[i][2];
        const low = (cur_notes[i][1] - new_time) / time_scale * 1000;
        const high = (cur_notes[i][2] - new_time) / time_scale * 1000;
        notesToDraw.push([cur_notes[i][0], low, high]);
      } else {
        if( foundStart && cur_notes[i][1] >= limit ) {
          break;
        }
      }
      i++;

    }
    this.setState({hidden_notes : new_i, notesToDraw : notesToDraw});
    if( this.props.changeFrom !== null ) {
      this.setState({notes : cur_notes});
    }
  }

  inBounds(l, t, time, timeScale) {
    return !(l > time + timeScale || t < time);
  }

  reset() {
    this.setState({hidden_notes : 0})
  }


  render() {
    return(
        //<canvas ref="canvas" width={1924} height={1000} />
      <NoteStreamCanvas notesToDraw={this.state.notesToDraw}/>
    )
  }
}

export default NoteStream