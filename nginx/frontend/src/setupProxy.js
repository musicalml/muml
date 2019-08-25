const proxy = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(proxy('/api', {target: 'http://nginx'}));
  app.use(proxy('/admin/', {target: 'http://nginx'}));
  app.use(proxy('/static/rest_framework', {target: 'http://nginx'}));
};
