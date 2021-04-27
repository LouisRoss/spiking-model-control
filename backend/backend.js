const express = require('express');
const favicon = require('serve-favicon');
const http = require('http');
const bodyParser = require('body-parser');
const path = require('path');
const net = require('net');

const cors = require("cors"); // enforce CORS, will be set to frontend URL when deployed

const cors_conf = {
  origin: ["http://0.0.0.0:5000"], // ! temporary
  methods: ["POST"],
};

const requestResponder = require('./request-responder');
var responder = new requestResponder();

const app = express();
//app.use(cors(cors_conf));
//app.options('/:connection', cors());
app.use(cors());

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

const router = express.Router();

router.get('/:command', (req, res) => {
  console.log(`GET request parameters: ${JSON.stringify(req.params)}`);
  const { command } = req.params;

  var response = { response: `Unrecognized command URL ${command}` };
  if (command == 'status') {
    console.log("Found status request ");
    var response = responder.handleStatusRequest()
  }

  res.json(response);
  console.log(`GET response: ${JSON.stringify(response)}`);
});

router.post('/:command', /*cors(),*/ (req, res) => {
  console.log(`POST request parameters: ${JSON.stringify(req.params)}`);
  const { command } = req.params;

  var response = { response: `Unrecognized command URL ${command}` };
  if (command == 'connection') {
    console.log("Found connection request " + JSON.stringify(req.body));
    var response = responder.handleConnectionRequest(req.body)
  }

  res.json(response);
  console.log(`POST response: ${JSON.stringify(response)}`);
});

var server = http.createServer(app);

const PORT = 5000;

app.use(bodyParser.json());

app.use('/', router);

app.use(express.static('public'));

server.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));

