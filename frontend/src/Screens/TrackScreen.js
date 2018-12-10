import React, {Component} from 'react';
import propTypes from 'prop-types';
import {Button, ButtonToolbar} from 'react-bootstrap';
import styles from './TrackScreen.module.css';


/**
 * A track info screen with controls to listen to/play a song
 */
class TrackScreen extends Component {
  /**
   * Default constructor
   * @param {Object} props - the props.
   */
  constructor(props) {
    super(props);
    const {trackId} = this.props.match.params;
    this.state = {
      trackId: trackId ? trackId : null,
    };
  };

  static propTypes = {
    match: propTypes.object,
  }

  /**
   * Renders the screen.
   * @return {React.Node} - the rendered screen.
   */
  render() {
    return (
      <div className={styles.Buttons}>
        <ButtonToolbar bsClass={styles.toolbar}>
          <Button href={`/play/${this.state.trackId}`}>Learn</Button>
          <Button href={`/listen/${this.state.trackId}`}>Listen</Button>
        </ButtonToolbar>
      </div>
    );
  }
};

export default TrackScreen;
