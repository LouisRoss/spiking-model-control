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
  const { command } = req.params;

  var response = { response: `Unrecognized GET command resource ${command}` };
  if (command == 'status') {
    var response = responder.handleStatusRequest()
  }

  res.json(response);
});

router.post('/:command', /*cors(),*/ (req, res) => {
  const { command } = req.params;

  var response = { response: `Unrecognized POST command resource ${command}` };
  if (command == 'connection') {
    var response = responder.handleConnectionRequest(req.body)
    res.json(response);
  }
  else if (command == 'passthrough') {
    var success = responder.handlePassthroughRequest(req.body, (data) => {
      res.json(data);
    });

    if (!success) {
      res.json({Error: 'Failed to send passthrough command (probably not connected)'})
    }
  }

  //res.json(response);
});

var server = http.createServer(app);

const PORT = 5000;

app.use(bodyParser.json());

app.use('/', router);

app.use(express.static('public'));

server.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));

