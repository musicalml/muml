import React, {Component} from 'react';
import propTypes from 'prop-types';
import {Button} from 'react-bootstrap';
import styles from './TrackScreen.module.css';
import {getTrackInfo} from 'Api';


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
      trackName: null,
    };
  };

  static propTypes = {
    match: propTypes.object,
  }

  /**
   * Loads the track name.
   */
  componentDidMount() {
    getTrackInfo(this.state.trackId).then((response) => {
      this.setState({trackName: response.name});
    });
  }

  /**
   * Renders the screen.
   * @return {React.Node} - the rendered screen.
   */
  render() {
    const {trackName} = this.state;
    return (
      <div className={styles.screen_container}>
        <div className={styles.header_container}>
          {trackName && <h1>{trackName}</h1>}
        </div>
        <div className={styles.buttons}>
          <div className={styles.option_wrapper}>
            <div className={styles.option_container}>
              <p>Learn the song by playing it chord by chord.</p>
              <Button bsSize='large' href={`/play/${this.state.trackId}`}>
                Learn
              </Button>
            </div>
          </div>
          <div className={styles.option_wrapper}>
            <div className={styles.option_container}>
              <p>Listen to the song and look at the notes played.</p>
              <Button bsSize='large' href={`/listen/${this.state.trackId}`}>
                Listen
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default TrackScreen;
