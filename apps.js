#!/usr/bin/env node

var config = require('config').config;

var security = require('./lib/security/security.js')(config.apps),
    middleware = require('./lib/middleware.js');
    express = require('express');

var app = express();
app.enable('trust proxy');
app.disable('x-powered-by');
var bodyParser = require("body-parser");

// enable cors
var cors = require('cors');
app.use(cors({
	methods: ['OPTIONS', 'POST']
}));

// parse application/json
app.use(bodyParser.json());

// gelf client
var gelfling = require('gelfling');

var clientGelf = gelfling(config.host, config.port, {
  defaults: {
        level: gelfling.INFO
    }
})

var gelfRouting = require('./lib/routes/gelf.js')(clientGelf, config);

app.post('/gelf/log/:app/:category/', middleware.securityToken(security), gelfRouting.gelfLog);

app.options('/gelf/log/:app/:category/', function (req, res){

});


app.get('/status', function (req, res){
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).end('OK');
});



var port = process.env.NODE_PORT || 8080;

app.listen(port);
console.log('Server running at http://127.0.0.1:'+port+' in '+app.settings.env+' mode');
