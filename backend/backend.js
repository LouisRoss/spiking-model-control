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

const singleton = require('./status-poller');
const controller = singleton.getInstance(); 

const app = express();
//app.use(cors(cors_conf));
//app.options('/:connection', cors());
app.use(cors());

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))

const router = express.Router();
router.post('/:connection', /*cors(),*/ (req, res) => {
  const { server } = req.body;

  console.log(`Found request ${JSON.stringify(req.body)}`)
  var response = controller.parseRequest(req.body)

  res.body = response;
  res.send(JSON.stringify(response));
  console.log(JSON.stringify(response));
});

var server = http.createServer(app);

const PORT = 5000;

app.use(bodyParser.json());

app.use('/', router);

app.use(express.static('public'));

server.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));

