import React, {Component} from 'react';
import {Button, ListGroup, ListGroupItem} from 'react-bootstrap';

import apiCall, {getTracks} from 'Api';

import './TrackSelectionScreen.css';

/**
 * A screen for selecting a song to play.
 * @class TrackSelectionScreen
 */
class TrackSelectionScreen extends Component {
  /**
   * Default constructor.
   */
  constructor() {
    super();
    this.state = {
      tracks: null,
      nextPageUrl: null,
      prevPageUrl: null,
    };
    this.onTracksLoaded = this.onTracksLoaded.bind(this);
    this.gotoNextPage = this.gotoNextPage.bind(this);
    this.gotoPrevPage = this.gotoPrevPage.bind(this);
  }

  loadTrackList() {
    getTracks().then(this.onTracksLoaded).catch(console.log);
  }

  gotoNextPage() {
    apiCall('GET', this.state.nextPageUrl).then(this.onTracksLoaded);
  }

  gotoPrevPage() {
    apiCall('GET', this.state.prevPageUrl).then(this.onTracksLoaded);
  }

  /**
   * Fetches the track list.
   */
  componentDidMount() {
    this.loadTrackList();
  }

  /**
   * Processes API response and sets the track list.
   * @param {Object} response - the API response.
   */
  onTracksLoaded(response) {
    this.setState({
      ...this.state,
      tracks: response.results,
      nextPageUrl: response.next,
      prevPageUrl: response.previous,
    });
  }

  /**
   * Renders links to the songs.
   * @return {React.Node} - The rendered list screen.
   */
  render() {
    const {tracks, prevPageUrl, nextPageUrl} = this.state;
    return (
      <div className={'screen_container'}>
        {tracks === null && 'Nothing to see here...'}
        {tracks === [] && 'No tracks found...'}
        <ListGroup>
          {tracks && tracks.map((track) => (
            <ListGroupItem href={`/play/${track.id}`} key={track.id}>
              {track.name}
            </ListGroupItem>
          ))}
        </ListGroup>
        <div className={'next_prev_button_container'}>
          <Button disabled={prevPageUrl === null} onClick={this.gotoPrevPage}>
            Prev page
          </Button>
          <Button disabled={nextPageUrl === null} onClick={this.gotoNextPage}>
            Next page
          </Button>
        </div>
      </div>
    );
  }
}

export default TrackSelectionScreen;