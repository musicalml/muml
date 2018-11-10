import React, {Component} from 'react';
import {Button, ButtonToolbar, ListGroup} from 'react-bootstrap';
import styles from './TrackScreen.module.css';


class TrackScreen extends Component {
  constructor(props) {
    super(props);
    const {trackId} = this.props.match.params;
    this.state = {
      trackId: trackId ? trackId : null
    }
  };

  render() {
    return (
      <div className={styles.Buttons}>
        <ButtonToolbar bsClass={styles.toolbar}>
          <Button href={`/play/${this.state.trackId}`}>Learn</Button>
          <Button href={`/listen/${this.state.trackId}`}>Listen</Button>
        </ButtonToolbar>
      </div>
  )
  }
};

export default TrackScreen;