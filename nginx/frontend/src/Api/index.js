import Cookies from 'js-cookie';

/**
 * Generates a request function for the provided API method.
 * @param {Object} method - HTTP method.
 * @param {String} url - API handle url.
 * @param {Object} params - query/data to send, will be JSONified for non-GETs
 * @return {Promise} - a promise for parsed json response.
 */
const apiCall = (method, url, params) => {
  const csrfToken = Cookies.get('csrftoken');
  if (csrfToken === undefined) {
    return fetch(`${baseApiUrl}/csrf_token/`)
        .then((response) => response.json())
        .then((data) => {
          Cookies.set('csrftoken', data.csrf_token);
          return apiCall(method, url, params);
        });
  }
  const {data, requestUrl} = (() => {
    if (params === null || params === undefined) {
      return {data: null, requestUrl: url};
    }
    if (method === 'GET') {
      const query = new URLSearchParams(params).toString();
      const requestUrl = `${url}?${query}`;
      return {data: null, requestUrl};
    } else {
      return {data: params, requestUrl: url};
    }
  })();
  return fetch(requestUrl, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: data != null ? JSON.stringify(data) : null,
    credentials: 'include',
  }).then((response) => {
    if (!response.ok) {
      throw Error(response.statusText);
    }
    return response.json();
  });
};

const baseApiUrl = '/api';

const getTracks = (data)=>(
  apiCall('GET', `${baseApiUrl}/track/`, data)
);
const getTrackInfo = (trackId)=>(
  apiCall('GET', `${baseApiUrl}/track/${trackId}/`));
const compareTracks = (trackId, data)=>(
  apiCall('POST', `${baseApiUrl}/track/${trackId}/compare/`, data));
const getChords = (trackId)=>(
  apiCall('GET', `${baseApiUrl}/track/${trackId}/chords/`));
const getNotes = (trackId)=>(
  apiCall('GET', `${baseApiUrl}/track/${trackId}/notes/`));

const apiFormData = (method, url, data) => {
  const csrfToken = Cookies.get('csrftoken');
  if (csrfToken === undefined) {
    return fetch(`${baseApiUrl}/csrf_token/`)
        .then((response) => response.json())
        .then((json) => {
          Cookies.set('csrftoken', json.csrf_token);
          return apiFormData(method, url, data);
        });
  }
  return fetch(url, {
    method: method,
    body: data,
    credentials: 'include',
  }).then((response) => {
    if (!response.ok) {
      return null;
    }
    return response.json();
  });
};

const loadMidi = (file, name)=>{
  let data = new FormData();
  data.append('files', file, name);
  return apiFormData('POST', `${baseApiUrl}/load_midi/`, data);
};

export default apiCall;
export {getChords, getTracks, getTrackInfo, getNotes, compareTracks, loadMidi};
