const express = require('express');
const favicon = require('serve-favicon');
const http = require('http');
const bodyParser = require('body-parser');
const path = require('path');
const net = require('net');

const singleton = require('./status-poller');
const controller = singleton.getInstance(); 

const app = express();
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))

const router = express.Router();
router.post('/:connection', (req, res) => {
  const { server } = req.body;

  console.log(`Found request ${JSON.stringify(req.body)}`)
  controller.parseRequest(req.body);

  var response = {response: "Ok", instance: controller.count};
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