import React, {Component} from 'react';
import PropTypes from 'prop-types';
const bw = 0.72;
const shift = [
  0,
  1 - bw/2,
  1,
  2 - bw/2,
  2,
  3,
  4 - bw/2,
  4,
  5 - bw/2,
  5,
  6 - bw/2,
  6,
];
const blackKeys = [1, 3, 6, 8, 10];
const R = 5;

/**
 * A canvas without any renderings for drawing notes.
 */
class PureCanvas extends React.Component {
  /**
   * This canvas never re-renders for speed purposes.
   * @return {Boolean} false.
   */
  shouldComponentUpdate() {
    return false;
  }

  static propTypes = {
    contextRef: PropTypes.func,
  }

  /**
   * Creates canvas, most likely called just once.
   * @return {React.Node} - the canvas object.
   */
  render() {
    return (
      <canvas
        width="1924"
        height="1000"
        ref={(node) =>
          node ? this.props.contextRef(node.getContext('2d')) : null
        }
      />
    );
  }
}

/**
 * A class responsible for drawing notes on the canvas.
 * The only public method (ref for performance) is drawNote.
 */
class NoteStreamCanvas extends Component {
  /**
   * Default constructor.
   * @param {Object} props - the props.
   */
  constructor(props) {
    super(props);
    this.drawNote = this.drawNote.bind(this);
    this.saveContext = this.saveContext.bind(this);
  }

  /**
   * Saves the reference to the canvas 2d context.
   * @param {Object} ctx - the canvas drawing context.
   */
  saveContext(ctx) {
    this.ctx = ctx;
    this.width = this.ctx.canvas.width;
    this.height = this.ctx.canvas.height;
  }

  /**
   * Function invoked after render call, updating all the notes.
   */
  componentDidUpdate() {
    const {notesToDraw} = this.props;
    this.ctx.clearRect(0, 0, 1924, 1000);
    for (let i = 0; i < notesToDraw.length; ++i) {
      this.drawNote(notesToDraw[i][0], notesToDraw[i][1], notesToDraw[i][2]);
    }
  }

  drawNote(note, low, high) {
    const x = this.noteToX(note);
    const color = (blackKeys.includes(note%12)) ? 'DarkSlateGray' : 'DarkGreen';
    const width = (blackKeys.includes(note%12)) ? 37*bw : 37;
    this.ctx.fillStyle = color;
    this.roundRect(this.ctx, x, 1000-high, width, high-low, R, true, true);
  }

  /**
   * Maps the note to the approptiate x coordinate for the left corner.
   * @param {Integer} note - midi note number.
   * @return {Integer} - the coordinate of the left side.
   */
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
    ctx.quadraticCurveTo(x + width, y + height,
        x + width - radius.br, y + height);
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

  /**
   * Works only on the first call, creating the canvas, later on it is a no-op.
   * @return {React.Node} - the canvas.
   */
  render() {
    return <PureCanvas contextRef={this.saveContext} />;
  }
}

/**
 * The primary class, draws the notes passed via props
 */
class NoteStream extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notes: props.notes.sort((a, b) => a[1] - b[1]), // note, start, finish
      notesToDraw: [],
      time: props.time,
      hidden_notes: 0, // How many notes already played.
    };
    this.drawNotes = this.drawNotes.bind(this);
    this.inBounds = this.inBounds.bind(this);
    this.reset = this.reset.bind(this);
  }

  /**
   * Draws notes according to the current time.
   * @param {Float} newTime - current time in seconds.
   * @param {Float} timeScale - how many seconds fit on the screen.
   */
  drawNotes(newTime, timeScale) {
    const curNotes = this.props.change !== null ? this.props.notes
                                                : this.state.notes;

    let i = this.state.hidden_notes;
    let foundStart = false;
    let newI = i;
    let limit = 1000;
    let notesToDraw = [];

    while (true) {
      if (i >= curNotes.length) {
        break;
      }
      if (this.inBounds(curNotes[i][1], curNotes[i][2], newTime, timeScale)) {
        if (!foundStart) {
          newI = i;
          foundStart = true;
        }
        limit = curNotes[i][2];
        const low = (curNotes[i][1] - newTime) / timeScale * 1000;
        const high = (curNotes[i][2] - newTime) / timeScale * 1000;
        notesToDraw.push([curNotes[i][0], low, high]);
      } else {
        if (foundStart && curNotes[i][1] >= limit) {
          break;
        }
      }
      i++;
    }

    this.setState({hidden_notes: newI, notesToDraw: notesToDraw});
    if (this.props.changeFrom !== null) {
      this.setState({notes: curNotes});
    }
  }

  /**
   * Checks if the given note is within the screen space.
   * @param {Float} l - time when the note starts in seconds.
   * @param {Float} t - time when the note ends in seconds.
   * @param {Float} time - current time.
   * @param {Float} timeScale - how many seconds fit on the screen.
   * @return {Boolean} - the flag.
   */
  inBounds(l, t, time, timeScale) {
    return !(l > time + timeScale || t < time);
  }

  /**
   *
   */
  reset() {
    this.setState({hidden_notes: 0});
  }

  /**
   * Redraws the notes on the canvas.
   * @return {React.Node} - the canvas with notes drawn.
   */
  render() {
    return (
      <NoteStreamCanvas notesToDraw={this.state.notesToDraw}/>
    );
  }
}

export default NoteStream;
