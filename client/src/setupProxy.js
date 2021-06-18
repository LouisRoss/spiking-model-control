const createProxyMiddleware = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/analyze',
    createProxyMiddleware({
      target: `http://192.168.1.142:5000`,
      changeOrigin: true,
    })
  );
};

//      target: `http://backend:5000`,
