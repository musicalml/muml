import Cookies from 'js-cookie';

/**
 * Generates a request function for the provided API method.
 * @param {Object} method - HTTP method.
 * @param {String} url - API handle url.
 * @param {Object} params - query/data to send, will be JSONified for non-GETs
 * @return {Promise} - a promise for parsed json response.
 */
const apiCall = (method, url, params) => {
  const {data, requestUrl} = (() => {
    if (params == null) {
      return {data: null, requestUrl: url};
    }
    if (method == 'GET') {
      const data = null;
      const esc = encodeURIComponent;
      const query = Object.keys(params)
          .map((k) => `${esc(k)}=${esc(params[k])}`)
          .join('&');
      const requestUrl = `${url}?${query}`;
      return {data, requestUrl};
    } else {
      const requestUrl = url;
      const data = params;
      return {data, requestUrl};
    }
  })();
  return fetch(requestUrl, {
    method: method,
    headers: {
      'X-CSRFToken': Cookies.get('csrftoken'),
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

const getTracks = ()=>(
  apiCall('GET', `${baseApiUrl}/track/`, {})
);
const getTrackInfo = (trackId)=>(
  apiCall('GET', `${baseApiUrl}/track/${trackId}/`));
const compareTracks = (trackId, data)=>(
  apiCall('POST', `${baseApiUrl}/track/${trackId}/compare/`));

export default apiCall;
export {getTracks, getTrackInfo, compareTracks};
