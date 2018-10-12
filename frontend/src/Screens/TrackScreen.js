import React, {Component} from 'react';
import PropTypes from 'prop-types';

import Piano from 'Piano';
import {getTrackInfo, compareTracks} from 'Api';

import './TrackScreen.css';

/**
 * A screen for playing a song or free play.
 */
class TrackScreen extends Component {
  /**
   * Default constructor.
   * @param {Object} props - the props.
   */
  constructor(props) {
    super(props);
    const {trackId} = this.props.match.params;
    this.state = {
      track: null,
      trackId: trackId ? trackId : null,
    };
    this.onTrackLoaded = this.onTrackLoaded.bind(this);
  }

  static propTypes = {
    match: PropTypes.object,
  }

  /**
   * Fetches the track.
   */
  componentDidMount() {
    if (this.state.trackId !== null) {
      getTrackInfo(this.state.trackId).then(this.onTrackLoaded);
    }
  }

  /**
   * Updates state on API response setting the song.
   * @param {Object} response - the API response.
   */
  onTrackLoaded(response) {
    console.log(response);
    this.setState({
      ...this.state,
      track: response.messages,
    });
  }

  /**
   * Renders the piano and controls.
   * @return {React.Node} - The rendered screen.
   */
  render() {
    const {track} = this.state;
    return (
      <div className={'screen_container'}>
        {track !== null && <Piano />}
      </div>
    );
  }
}

export default TrackScreen;
