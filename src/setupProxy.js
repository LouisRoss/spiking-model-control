const createProxyMiddleware = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    createProxyMiddleware(
      '/api', {
      target: `http://192.168.1.150:5000`,
      changeOrigin: true,
      pathrewrite: {
        '^/api' : '',
      }
    })
  );
};

//      target: `http://backend:5000`,
