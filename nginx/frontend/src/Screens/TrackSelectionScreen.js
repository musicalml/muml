import React, {Component} from 'react';
import {DropdownButton, DropdownItem, Button, ListGroup, ListGroupItem} from
  'react-bootstrap';

import apiCall, {getTracks} from 'Api';

import styles from './TrackSelectionScreen.module.css';

const filters = {
  'nd': 'Note density',
  'pcv': 'Pitch class variability',
  'mom': 'Major or minor',
  'mcmi': 'Most common melodic interval',
  'mmi': 'Mean melodic interval',
  'aoa': 'Amount of arpeggiation',
  'rn': 'Repeated notes',
  'cm': 'Chromatic motion',
  'mthirds': 'Melodic thirds',
  'vt': 'Vertical thirds',
  'mtemp': 'Mean tempo',
  'dis': 'Duration in seconds',
};

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
      sortBy: null,
    };
    this.onTracksLoaded = this.onTracksLoaded.bind(this);
    this.gotoNextPage = this.gotoNextPage.bind(this);
    this.gotoPrevPage = this.gotoPrevPage.bind(this);
  }

  /**
   * Fetches the first page of the track list.
   */
  loadTrackList(sortBy) {
    if (sortBy === undefined) {
      sortBy = this.state.sortBy;
    }
    const sort = sortBy === null ? {} : {f: sortBy};
    getTracks(sort).then(this.onTracksLoaded).catch(console.log);
  }

  /**
   * Fetches the next page of the track list.
   */
  gotoNextPage() {
    apiCall('GET', this.state.nextPageUrl).then(this.onTracksLoaded);
  }

  /**
   * Fetches the previous page of the track list.
   */
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
    console.log(response);
    this.setState({
      tracks: response.results,
      nextPageUrl: response.next,
      prevPageUrl: response.previous,
    });
  }

  /**
   * Callback for when a sorting option is selected.
   * @param {String} key - the selected option.
   */
  onSortOptionSelect(key) {
    if (key === this.state.sortBy) {
      return;
    }
    this.setState({
      sortBy: key,
      nexPageUrl: null,
      prevPageUrl: null,
    });
    this.loadTrackList(key);
  }

  /**
   * Renders links to the songs.
   * @return {React.Node} - The rendered list screen.
   */
  render() {
    const {sortBy, tracks, prevPageUrl, nextPageUrl} = this.state;
    return (
      <div className={styles.screen_container}>
        <h1>
          Select a song
        </h1>
        <div className={styles.list_container}>
          {tracks === null && 'Nothing to see here...'}
          {tracks === [] && 'No tracks found...'}
          {tracks && <ListGroup style={{width: '100%'}}>
            {tracks && tracks.map((track) => (
              <ListGroupItem action href={`/tracks/${track.id}`} key={track.id}>
                {track.name}
              </ListGroupItem>
            ))}
          </ListGroup> }
        </div>
        <div className={styles.next_prev_button_container}>
          <Button variant="dark" disabled={prevPageUrl === null} onClick={this.gotoPrevPage}>
            Prev page
          </Button>
          <DropdownButton
            title='Sort by'
            id='sort_by'
            onSelect={this.onSortOptionSelect.bind(this)}
            dropup
            variant="dark"
          >
            <DropdownItem eventKey={null} active={sortBy === null}>
              Name
            </DropdownItem>
            <DropdownItem variant="dark" divider />
            {Object.keys(filters).sort().map((key)=>
              <DropdownItem eventKey={key} active={key === sortBy} key={key}>
                {filters[key]}
              </DropdownItem>
            )}
          </DropdownButton>
          <Button disabled={nextPageUrl === null} variant="dark" onClick={this.gotoNextPage}>
            Next page
          </Button>
        </div>
      </div>
    );
  }
}

export default TrackSelectionScreen;
