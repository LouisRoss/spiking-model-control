const express = require('express');
const createProxyMiddleware = require('http-proxy-middleware');
const favicon = require('serve-favicon');
const http = require('http');
const bodyParser = require('body-parser');
const path = require('path');
const net = require('net');

const cors = require("cors"); // enforce CORS, will be set to frontend URL when deployed

const cors_conf = {
  origin: ["http://0.0.0.0:5000"], // ! temporary
  methods: ["POST", "GET"],
};

const app = express();
//app.use(cors(cors_conf));
//app.options('/:connection', cors());
app.use(cors());

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

const proxyMiddleware = createProxyMiddleware({
  target: 'http://192.168.1.150:5000',
  changeOrigin: true,
});

app.use(proxyMiddleware);

var server = http.createServer(app);

const PORT = 5001;

app.use(bodyParser.json());

app.use(express.static('public'));

server.listen(PORT, () => console.log(`Server running on port http://backend:${PORT}`));

